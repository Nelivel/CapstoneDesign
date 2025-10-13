# ===== 초기 설정 =====
import os
from pathlib import Path

CACHE_DIR = '/mnt/qdrant-data/huggingface-cache'
os.makedirs(CACHE_DIR, exist_ok=True)

os.environ['HF_HOME'] = CACHE_DIR
os.environ['TRANSFORMERS_CACHE'] = CACHE_DIR
os.environ['TORCH_HOME'] = CACHE_DIR
os.environ['XDG_CACHE_HOME'] = CACHE_DIR
os.environ['MKL_THREADING_LAYER'] = 'GNU'
os.environ['MKL_SERVICE_FORCE_INTEL'] = '1'

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import MySQLdb
from MySQLdb.cursors import DictCursor
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from datetime import datetime
import json
import pandas as pd
from dotenv import load_dotenv
from contextlib import contextmanager
import httpx
import asyncio
from functools import lru_cache
import hashlib
import time
import random
from collections import defaultdict

# ===== 환경 변수 =====
BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env", override=True)

app = FastAPI(title="RAG Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== 설정 =====
IMAGE_BASE_DIR = "/mnt/sdb-data/daangn_images"
SERVER_HOST = os.getenv("SERVER_HOST", "localhost")
SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))
SERVER_PROTOCOL = os.getenv("SERVER_PROTOCOL", "http")
BASE_URL = f"{SERVER_PROTOCOL}://{SERVER_HOST}:{SERVER_PORT}"

try:
    app.mount("/static/images", StaticFiles(directory=IMAGE_BASE_DIR), name="images")
except Exception:
    pass

MYSQL_CONFIG = {
    "user": os.getenv("DB_USER"),
    "passwd": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "db": os.getenv("DB_NAME"),
    "charset": "utf8mb4",
    "use_unicode": True
}

ssl_mode = os.getenv('DB_SSL_MODE', 'required').lower()
ssl_ca = os.getenv("MYSQL_SSL_CA")

if ssl_mode not in ['disabled', 'insecure']:
    if ssl_ca and os.path.exists(ssl_ca):
        MYSQL_CONFIG["ssl"] = {"ca": ssl_ca}
    else:
        MYSQL_CONFIG["ssl"] = True

QDRANT_HOST = os.getenv("QDRANT_HOST", "127.0.0.1")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "items")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

# ===== Qdrant 초기화 =====
qdrant_client = None
try:
    api_key_to_use = QDRANT_API_KEY.strip() if QDRANT_API_KEY and QDRANT_API_KEY.strip() else None
    qdrant_client = QdrantClient(
        host=QDRANT_HOST,
        port=QDRANT_PORT,
        api_key=api_key_to_use,
        https=False,
        prefer_grpc=False,
        timeout=60
    )
    
    collections = qdrant_client.get_collections()
    collection_names = [c.name for c in collections.collections]
    
    if COLLECTION_NAME not in collection_names:
        qdrant_client = None
except Exception:
    qdrant_client = None

# ===== 모델 로딩 =====
text_encoder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
recommendation_weights = pd.read_csv(os.getenv("CSV_PATH"))

CATEGORY_TIME_SENSITIVITY = {
    '디지털기기': 0.002, '가전제품': 0.002, '스포츠/레저': 0.0015,
    '의류': 0.001, '뷰티/미용': 0.001, '완구': 0.001,
    '가구/인테리어': 0.0005, '도서': 0.0003, '생활/주방': 0.0008, '기타': 0.001
}

reranking_cache = {}
CACHE_EXPIRY_SECONDS = 3600


# ==================== Pydantic 모델 ====================

class RecommendationRequest(BaseModel):
    user_id: int
    page: int = 0
    enable_rerank: bool = False
    llm_model: str = "mistral-small-latest"


class RAGRecommendationResponse(BaseModel):
    summary: str
    reasoning: str
    items: List['ItemResponse']
    total_items: int
    reranked: Optional[bool] = False
    llm_model: Optional[str] = None
    search_strategy: Optional[str] = None


class ItemResponse(BaseModel):
    dbid: int
    id: str
    title: str
    price: Optional[float]
    time_elapsed: str
    thumbnail_url: Optional[str]
    category: Optional[str]
    relevance_score: float


# ==================== 유틸리티 ====================

@contextmanager
def get_db_connection():
    conn = MySQLdb.connect(**MYSQL_CONFIG)
    try:
        yield conn
    finally:
        conn.close()


def convert_path_to_url(local_path: Optional[str], request: Request = None) -> Optional[str]:
    if not local_path or local_path.startswith("http"):
        return local_path
    
    if local_path.startswith(IMAGE_BASE_DIR):
        relative_path = local_path[len(IMAGE_BASE_DIR):].lstrip('/')
        
        if request:
            host = request.headers.get("host", f"{SERVER_HOST}:{SERVER_PORT}")
            protocol = "https" if request.url.scheme == "https" else "http"
            return f"{protocol}://{host}/static/images/{relative_path}"
        
        return f"{BASE_URL}/static/images/{relative_path}"
    
    return local_path


def calculate_time_elapsed(created_at: datetime) -> str:
    diff = datetime.now() - created_at
    
    if diff.days > 365:
        return f"{diff.days // 365}년 전"
    elif diff.days > 30:
        return f"{diff.days // 30}개월 전"
    elif diff.days > 0:
        return f"{diff.days}일 전"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600}시간 전"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60}분 전"
    else:
        return "방금 전"


def calculate_time_weight_by_category(timestamp_str: str, category: str) -> float:
    try:
        timestamp = datetime.fromisoformat(timestamp_str.replace(' ', 'T'))
        elapsed_hours = (datetime.now() - timestamp).total_seconds() / 3600
        decay_rate = CATEGORY_TIME_SENSITIVITY.get(category, 0.001)
        return max(0.1, min(1.0, 1.0 / (1 + decay_rate * elapsed_hours)))
    except:
        return 0.5


# ==================== 캐싱 & 데이터 조회 ====================

@lru_cache(maxsize=1000)
def get_user_profile_cached(user_id: int):
    with get_db_connection() as conn:
        cursor = conn.cursor(DictCursor)
        try:
            cursor.execute("SELECT userId, score, gender FROM user WHERE userId = %s", (user_id,))
            return cursor.fetchone()
        finally:
            cursor.close()


@lru_cache(maxsize=1000)
def get_user_weights_cached(user_id: int):
    with get_db_connection() as conn:
        cursor = conn.cursor(DictCursor)
        try:
            cursor.execute("""
                SELECT 
                    category_weights, top_keywords, interaction_count,
                    total_visits, total_searches, csv_ratio, lastUpdatedAt
                FROM user_personalization_weights 
                WHERE userId = %s
            """, (user_id,))
            
            result = cursor.fetchone()
            if not result:
                return None
            
            last_updated = result['lastUpdatedAt']
            data_age_days = (datetime.now() - last_updated).days if last_updated else 999
            
            return {
                'category_weights': json.loads(result['category_weights']) if isinstance(result['category_weights'], str) else result['category_weights'],
                'top_keywords': json.loads(result['top_keywords']) if isinstance(result['top_keywords'], str) else result['top_keywords'],
                'csv_ratio': result['csv_ratio'],
                'interaction_count': result['interaction_count'],
                'total_visits': result['total_visits'],
                'total_searches': result['total_searches'],
                'data_age_days': data_age_days,
                'confidence_score': min(1.0, result['interaction_count'] / 100.0)
            }
        finally:
            cursor.close()


@lru_cache(maxsize=1000)
def get_user_recent_history_cached(user_id: int, days: int = 7):
    with get_db_connection() as conn:
        cursor = conn.cursor(DictCursor)
        try:
            cursor.execute("""
                SELECT DISTINCT i.category
                FROM item_visit_history v
                JOIN items i ON v.itemDbid = i.dbid
                WHERE v.userId = %s
                  AND v.visitedAt >= DATE_SUB(NOW(), INTERVAL %s DAY)
                  AND i.category IS NOT NULL
                LIMIT 3
            """, (user_id, days))
            
            return tuple([r['category'] for r in cursor.fetchall()])
        finally:
            cursor.close()


async def get_user_data_parallel(user_id: int):
    profile, weights, history = await asyncio.gather(
        asyncio.to_thread(get_user_profile_cached, user_id),
        asyncio.to_thread(get_user_weights_cached, user_id),
        asyncio.to_thread(get_user_recent_history_cached, user_id, 7),
        return_exceptions=False
    )
    return profile, weights, list(history) if history else []


# ==================== 가중치 계산 ====================

def get_csv_weights(user: dict) -> dict:
    age_group = "20대"
    gender_raw = user.get('gender', '').lower() if user else 'male'
    gender = "남" if gender_raw in ['male', 'man', '남', '남성'] else "여"
    
    weights = recommendation_weights[
        (recommendation_weights['Age_Group'] == age_group) & 
        (recommendation_weights['Gender'] == gender)
    ]
    
    if weights.empty:
        return {}
    
    return dict(zip(weights['Category'], weights['Final_Weight']))


def blend_weights_with_confidence(
    csv_weights: dict, 
    personal_weights: dict, 
    csv_ratio: float,
    recent_categories: List[str] = None,
    confidence_score: float = 0.0,
    data_age_days: int = 0
) -> dict:
    
    if data_age_days > 30:
        age_penalty = min(0.3, (data_age_days - 30) / 100)
        csv_ratio = min(1.0, csv_ratio + age_penalty)
    
    if confidence_score < 0.3:
        csv_ratio = max(csv_ratio, 0.7)
    
    personal_ratio = 1.0 - csv_ratio
    all_categories = set(csv_weights.keys()) | set(personal_weights.keys())
    
    blended = {}
    for category in all_categories:
        csv_w = csv_weights.get(category, 0.05)
        personal_w = personal_weights.get(category, 0.0)
        weight = (csv_w * csv_ratio) + (personal_w * personal_ratio)
        
        if recent_categories and category in recent_categories:
            boost_factor = 1.15 + (confidence_score * 0.15)
            weight *= boost_factor
        
        blended[category] = weight
    
    return blended


# ==================== 검색 ====================

async def search_items_hybrid(
    top_keywords: List[str], 
    category_weights: dict,
    recent_categories: List[str] = None, 
    limit: int = 500
) -> tuple[List[int], str]:
    
    if not qdrant_client:
        fallback_ids = search_by_category_boost(None, limit=limit)
        return fallback_ids, "db_fallback"
    
    all_results = {}
    strategy = "unknown"
    
    has_recent_categories = recent_categories and len(recent_categories) > 0
    has_strong_weights = category_weights and max(category_weights.values()) > 0.3
    has_keywords = top_keywords and len(top_keywords) > 0
    
    if has_recent_categories:
        strategy = "category_focused"
        
        category_items = search_by_category_boost(recent_categories[0], limit=100)
        for dbid in category_items:
            all_results[dbid] = 0.8
        
        if len(recent_categories) > 1:
            category_items = search_by_category_boost(recent_categories[1], limit=50)
            for dbid in category_items:
                if dbid not in all_results:
                    all_results[dbid] = 0.7
        
        top_other_categories = sorted(
            [(c, w) for c, w in category_weights.items() 
             if c not in recent_categories],
            key=lambda x: -x[1]
        )[:5]
        
        for category, weight in top_other_categories:
            category_items = search_by_category_boost(category, limit=50)
            for dbid in category_items:
                if dbid not in all_results:
                    all_results[dbid] = weight * 0.6
        
        if has_keywords:
            keyword_query = ' '.join(top_keywords[:2])
            query_vector = text_encoder.encode(keyword_query).tolist()
            
            search_result = qdrant_client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                using="text",
                limit=100,
                with_payload=True,
                score_threshold=0.2
            )
            
            for point in search_result.points:
                dbid = point.payload.get('dbid')
                if dbid and dbid not in all_results:
                    all_results[dbid] = point.score * 0.5
    
    elif has_strong_weights:
        strategy = "weight_based"
        
        top_categories = sorted(category_weights.items(), key=lambda x: -x[1])[:3]
        
        for idx, (category, weight) in enumerate(top_categories):
            limit_per_cat = [150, 100, 50][idx]
            category_items = search_by_category_boost(category, limit=limit_per_cat)
            
            for dbid in category_items:
                score = weight * (0.8 - idx * 0.1)
                if dbid not in all_results or all_results[dbid] < score:
                    all_results[dbid] = score
        
        if has_keywords:
            keyword_query = ' '.join(top_keywords[:2])
            query_vector = text_encoder.encode(keyword_query).tolist()
            
            search_result = qdrant_client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                using="text",
                limit=100,
                with_payload=True,
                score_threshold=0.15
            )
            
            for point in search_result.points:
                dbid = point.payload.get('dbid')
                if dbid and dbid not in all_results:
                    all_results[dbid] = point.score * 0.5
    
    elif has_keywords:
        strategy = "keyword_based"
        
        keyword_query = ' '.join(top_keywords[:3])
        query_vector = text_encoder.encode(keyword_query).tolist()
        
        search_result = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            using="text",
            limit=400,
            with_payload=True,
            score_threshold=0.15
        )
        
        for point in search_result.points:
            dbid = point.payload.get('dbid')
            if dbid:
                all_results[dbid] = point.score * 0.8
    
    else:
        strategy = "csv_diverse"
        
        top_csv_categories = sorted(category_weights.items(), key=lambda x: -x[1])[:8]
        
        for idx, (category, weight) in enumerate(top_csv_categories):
            category_items = search_by_category_boost(category, limit=100)
            for dbid in category_items:
                if dbid not in all_results:
                    score = weight * 0.7 + (random.random() * 0.1)
                    all_results[dbid] = score
        
        recent_items = search_by_category_boost(None, limit=100)
        for dbid in recent_items:
            if dbid not in all_results:
                all_results[dbid] = 0.4 + (random.random() * 0.1)
    
    sorted_results = sorted(all_results.items(), key=lambda x: (-x[1], x[0]))
    final_ids = [dbid for dbid, _ in sorted_results[:limit]]
    
    return final_ids, strategy


def search_by_category_boost(category: str = None, limit: int = 500) -> List[int]:
    with get_db_connection() as conn:
        cursor = conn.cursor(DictCursor)
        try:
            if category:
                cursor.execute("""
                    SELECT dbid FROM items
                    WHERE status = 1 AND category = %s
                    ORDER BY createdAt DESC LIMIT %s
                """, (category, limit))
            else:
                cursor.execute("""
                    SELECT dbid FROM items
                    WHERE status = 1
                    ORDER BY createdAt DESC LIMIT %s
                """, (limit,))
            
            return [r['dbid'] for r in cursor.fetchall()]
        finally:
            cursor.close()


# ==================== 아이템 조회 ====================

async def get_items_from_qdrant_payload(item_ids: List[int], limit: int = 200) -> List[dict]:
    if not qdrant_client:
        return get_items_with_denormalized_thumbnail(item_ids, 0, limit)
    
    try:
        valid_ids = [id for id in item_ids[:limit] if id and id > 0]
        
        if not valid_ids:
            return get_items_with_denormalized_thumbnail(item_ids, 0, limit)
        
        points = qdrant_client.retrieve(
            collection_name=COLLECTION_NAME,
            ids=valid_ids,
            with_payload=True,
            with_vectors=False
        )
        
        items = []
        for point in points:
            payload = point.payload
            
            dbid = payload.get('dbid')
            if not dbid:
                continue
            
            created_at = payload.get('createdAt')
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                except:
                    created_at = datetime.now()
            elif not isinstance(created_at, datetime):
                created_at = datetime.now()
            
            items.append({
                'dbid': dbid,
                'id': payload.get('id') or payload.get('item_id') or str(dbid),
                'title': payload.get('title', '제목 없음'),
                'category': payload.get('category', '기타'),
                'price': payload.get('price', 0),
                'createdAt': created_at,
                'thumbnailPath': payload.get('thumbnailPath') or payload.get('first_thumbnail') or payload.get('thumbnail')
            })
        
        if len(items) < len(valid_ids) * 0.5:
            return get_items_with_denormalized_thumbnail(item_ids, 0, limit)
        
        id_to_item = {item['dbid']: item for item in items}
        sorted_items = [id_to_item[dbid] for dbid in valid_ids if dbid in id_to_item]
        
        return sorted_items
        
    except Exception:
        return get_items_with_denormalized_thumbnail(item_ids, 0, limit)


def get_items_with_denormalized_thumbnail(item_ids: List[int], offset: int, limit: int = 50):
    with get_db_connection() as conn:
        cursor = conn.cursor(DictCursor)
        try:
            if not item_ids:
                return []
            
            paginated_ids = item_ids[offset:offset + limit]
            if not paginated_ids:
                return []
            
            placeholders = ','.join(['%s'] * len(paginated_ids))
            query = f"""
                SELECT dbid, id, title, price, createdAt, category,
                       first_thumbnail as thumbnailPath
                FROM items
                WHERE dbid IN ({placeholders}) AND status = 1
            """
            
            cursor.execute(query, tuple(paginated_ids))
            results = list(cursor.fetchall())
            
            id_to_item = {item['dbid']: item for item in results}
            sorted_results = [id_to_item[dbid] for dbid in paginated_ids if dbid in id_to_item]
            
            return sorted_results
            
        finally:
            cursor.close()


def apply_category_weights(items: List[dict], weights: dict) -> List[dict]:
    default_weight = 0.05
    
    for item in items:
        category = item.get('category', '').strip() if item.get('category') else ''
        base_weight = weights.get(category, default_weight) if category else default_weight
        
        time_weight = 1.0
        if category and item.get('createdAt'):
            created_at_str = item['createdAt'].isoformat() if isinstance(item['createdAt'], datetime) else str(item['createdAt'])
            time_weight = calculate_time_weight_by_category(created_at_str, category)
        
        item['relevance_score'] = base_weight * time_weight
    
    items.sort(key=lambda x: (-x.get('relevance_score', 0), x.get('dbid', 0)))
    return items


def apply_keyword_boost(items: List[dict], top_keywords: List[str], total_searches: int = 0) -> List[dict]:
    if not top_keywords or len(top_keywords) == 0:
        return items
    
    keyword_confidence = min(1.0, total_searches / 50.0)
    
    for item in items:
        title = item.get('title', '').lower()
        keyword_score = 0.0
        
        for idx, keyword in enumerate(top_keywords[:5]):
            if keyword.lower() in title:
                position_weight = 1.0 - (idx * 0.2)
                keyword_score += position_weight
        
        if keyword_score > 0:
            boost = 1.0 + (keyword_score * 0.3 * keyword_confidence)
            item['relevance_score'] = item.get('relevance_score', 0.5) * boost
    
    items.sort(key=lambda x: (-x.get('relevance_score', 0), x.get('dbid', 0)))
    return items


# ==================== LLM 리랭킹 ====================

def generate_cache_key(user_id: int, keywords: List[str], categories: List[str], model: str) -> str:
    key_data = f"{user_id}:{','.join(sorted(keywords[:3]))}:{','.join(sorted(categories[:3]))}:{model}"
    return hashlib.md5(key_data.encode()).hexdigest()


def clean_expired_cache():
    global reranking_cache
    current_time = time.time()
    expired_keys = [k for k, v in reranking_cache.items() 
                    if current_time - v['timestamp'] > CACHE_EXPIRY_SECONDS]
    for k in expired_keys:
        del reranking_cache[k]


def interleave_categories(items: List[dict], max_per_category: int = 8, force_distribute: bool = True) -> List[dict]:
    by_category = defaultdict(list)
    for item in items:
        category = item.get('category', '기타')
        by_category[category].append(item)
    
    if len(by_category) <= 2:
        return items
    
    categories = sorted(by_category.keys(), key=lambda c: -len(by_category[c]))
    
    if force_distribute:
        for cat in categories:
            cat_items = by_category[cat]
            if len(cat_items) > 1:
                max_score = max(item.get('relevance_score', 0) for item in cat_items)
                min_score = min(item.get('relevance_score', 0) for item in cat_items)
                
                if max_score > min_score:
                    for item in cat_items:
                        old_score = item.get('relevance_score', 0)
                        normalized = 0.7 + 0.3 * ((old_score - min_score) / (max_score - min_score))
                        item['relevance_score'] = normalized
    
    result = []
    positions = {cat: 0 for cat in categories}
    
    while len(result) < len(items):
        added_this_round = False
        
        for idx, cat in enumerate(categories):
            if positions[cat] >= len(by_category[cat]):
                continue
            
            if idx == 0:
                batch_size = 2
            elif idx <= 3:
                batch_size = 2
            else:
                batch_size = 1
            
            available = len(by_category[cat]) - positions[cat]
            batch_size = min(batch_size, available)
            
            if batch_size > 0:
                result.extend(by_category[cat][positions[cat]:positions[cat]+batch_size])
                positions[cat] += batch_size
                added_this_round = True
            
            if len(result) >= len(items):
                break
        
        if not added_this_round:
            break
    
    return result[:len(items)]


async def llm_rerank_items(
    items: List[dict],
    user_profile: dict,
    top_keywords: List[str],
    recent_categories: List[str],
    model: str = "mistral-small-latest"
) -> List[dict]:
    if not MISTRAL_API_KEY or len(items) == 0:
        return items
    
    try:
        gender_text = "여성" if user_profile.get('gender', '').lower() in ['female', 'woman', '여', '여성'] else "남성"
        keywords_text = ", ".join(top_keywords[:3]) if top_keywords else "없음"
        categories_text = ", ".join(recent_categories[:3]) if recent_categories else "없음"
        
        items_for_llm = items[:20]
        
        item_list = []
        for idx, item in enumerate(items_for_llm):
            item_list.append({
                "index": idx,
                "category": item.get('category', '기타'),
                "title": item['title'][:40],
                "price": int(item.get('price', 0)) if item.get('price') else 0
            })
        
        prompt = f"""당신은 중고거래 추천 전문가입니다.

사용자 프로필:
- 성별: {gender_text}
- 관심 키워드: {keywords_text}
- 최근 본 카테고리: {categories_text}

추천 후보 상품:
{json.dumps(item_list, ensure_ascii=False, indent=1)}

위 상품들을 사용자가 가장 관심있어 할 순서대로 정렬하세요.
최근 본 카테고리를 우선 고려하지만, 다양한 카테고리를 섞어주세요.
모든 index를 반드시 포함해야 합니다.

응답 형식 (JSON만):
{{
  "reranked_indices": [5, 2, 8, 0, 1, 3, ...]
}}"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {MISTRAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "중고거래 추천 큐레이터. 반드시 JSON으로만 응답."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "max_tokens": 200,
                    "response_format": {"type": "json_object"}
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                try:
                    llm_response = json.loads(content)
                    reranked_indices = llm_response.get('reranked_indices', [])
                    
                    if (reranked_indices and 
                        len(reranked_indices) == len(items_for_llm) and
                        set(reranked_indices) == set(range(len(items_for_llm)))):
                        
                        reranked = [items_for_llm[i] for i in reranked_indices]
                        reranked.extend(items[20:])
                        return reranked
                    
                except json.JSONDecodeError:
                    pass
        
        return items
    
    except:
        return items


async def apply_llm_reranking(
    item_ids: List[int],
    user_profile: dict,
    top_keywords: List[str],
    recent_categories: List[str],
    final_weights: dict,
    model: str = "mistral-small-latest"
) -> tuple[List[int], List[dict]]:
    if not MISTRAL_API_KEY or len(item_ids) == 0:
        return item_ids, []
    
    clean_expired_cache()
    
    cache_key = generate_cache_key(
        user_profile['userId'],
        top_keywords,
        recent_categories,
        model
    )
    
    if cache_key in reranking_cache:
        cached_data = reranking_cache[cache_key]
        return cached_data['reranked_ids'], cached_data.get('items', [])
    
    items_to_rerank = await get_items_from_qdrant_payload(item_ids[:200], limit=200)
    
    if not items_to_rerank:
        return item_ids, []
    
    items_to_rerank = apply_category_weights(items_to_rerank, final_weights)
    
    by_category = defaultdict(list)
    for item in items_to_rerank:
        category = item.get('category', '기타')
        by_category[category].append(item)
    
    mixed_items = []
    
    if recent_categories:
        for idx, cat in enumerate(recent_categories[:2]):
            if cat in by_category:
                take = 4 if idx == 0 else 3
                mixed_items.extend(by_category[cat][:take])
    
    sorted_categories = sorted(
        [(c, final_weights.get(c, 0.05)) for c in by_category.keys() 
         if c not in recent_categories[:2]],
        key=lambda x: -x[1]
    )
    
    for cat, weight in sorted_categories:
        if len(mixed_items) >= 20:
            break
        
        already_added = len([i for i in mixed_items if i.get('category') == cat])
        
        if weight > 0.3:
            target = 3
        elif weight > 0.15:
            target = 3
        else:
            target = 2
        
        remaining = target - already_added
        
        if remaining > 0:
            to_add = by_category[cat][:remaining]
            mixed_items.extend(to_add)
    
    mixed_items = mixed_items[:20]
    
    reranked_items = await llm_rerank_items(
        mixed_items,
        user_profile,
        top_keywords,
        recent_categories,
        model
    )
    
    reranked_items = interleave_categories(reranked_items, max_per_category=8, force_distribute=True)
    
    reranked_ids = [item['dbid'] for item in reranked_items]
    remaining_ids = [id for id in item_ids if id not in reranked_ids]
    
    final_reranked_ids = reranked_ids + remaining_ids
    
    reranking_cache[cache_key] = {
        'reranked_ids': final_reranked_ids,
        'items': reranked_items,
        'timestamp': time.time()
    }
    
    return final_reranked_ids, reranked_items


# ==================== 페이지네이션 ====================

def paginate_with_fallback(item_ids: List[int], page: int, limit: int = 50) -> List[int]:
    offset = page * limit
    total_items = len(item_ids)
    
    if total_items == 0:
        return []
    
    if offset >= total_items:
        return random.sample(item_ids, min(limit, total_items))
    
    paginated = item_ids[offset:offset + limit]
    
    if len(paginated) < limit:
        shortage = limit - len(paginated)
        already_shown = item_ids[:offset + len(paginated)]
        
        if len(already_shown) > 0:
            additional = random.choices(already_shown, k=shortage)
            paginated.extend(additional)
        else:
            additional = random.choices(paginated, k=shortage)
            paginated.extend(additional)
    
    return paginated


# ==================== API ====================

@app.post("/api/recommend", response_model=RAGRecommendationResponse)
async def recommend_with_rag(request: RecommendationRequest, http_request: Request):
    try:
        user_profile, personal_data, recent_categories = await get_user_data_parallel(request.user_id)
        
        if not user_profile:
            raise HTTPException(status_code=404, detail="사용자 없음")
        
        if personal_data:
            personal_weights = personal_data['category_weights']
            csv_ratio = personal_data['csv_ratio']
            top_keywords = personal_data['top_keywords']
            confidence_score = personal_data.get('confidence_score', 0.0)
            data_age_days = personal_data.get('data_age_days', 0)
            total_searches = personal_data.get('total_searches', 0)
        else:
            personal_weights = {}
            csv_ratio = 1.0
            top_keywords = []
            confidence_score = 0.0
            data_age_days = 999
            total_searches = 0
        
        csv_weights = get_csv_weights(user_profile)
        final_weights = blend_weights_with_confidence(
            csv_weights, personal_weights, csv_ratio, recent_categories,
            confidence_score, data_age_days
        )
        
        similar_item_ids, search_strategy = await search_items_hybrid(
            top_keywords, final_weights, recent_categories, limit=500
        )
        
        reranked_items_cache = []
        if request.enable_rerank:
            similar_item_ids, reranked_items_cache = await apply_llm_reranking(
                similar_item_ids, user_profile, top_keywords, recent_categories,
                final_weights, request.llm_model
            )
        
        paginated_ids = paginate_with_fallback(similar_item_ids, request.page, limit=50)
        
        if reranked_items_cache and request.page == 0:
            items = reranked_items_cache[:50]
        else:
            items = get_items_with_denormalized_thumbnail(paginated_ids, 0, len(paginated_ids))
            items = apply_category_weights(items, final_weights)
        
        if top_keywords and len(top_keywords) > 0:
            items = apply_keyword_boost(items, top_keywords, total_searches)
        
        if recent_categories and len(recent_categories) > 0:
            summary = f"'{recent_categories[0]}' 중심 {len(similar_item_ids)}개"
        elif top_keywords and len(top_keywords) > 0:
            summary = f"'{', '.join(top_keywords[:2])}' 검색 {len(similar_item_ids)}개"
        else:
            summary = f"추천 상품 {len(similar_item_ids)}개"
        
        if confidence_score > 0.5:
            summary += f" (맞춤 {int(confidence_score*100)}%)"
        elif confidence_score > 0:
            summary += f" (학습 중 {int(confidence_score*100)}%)"
        
        reasoning = search_strategy
        if request.enable_rerank:
            reasoning += " + LLM"
        if confidence_score < 0.3:
            reasoning += " (통계 중심)"
        
        response_items = []
        for item in items:
            if not item.get('dbid') or not item.get('title'):
                continue
            
            response_items.append(
                ItemResponse(
                    dbid=item['dbid'],
                    id=item.get('id') or str(item['dbid']),
                    title=item['title'],
                    price=item.get('price', 0),
                    time_elapsed=calculate_time_elapsed(item['createdAt']),
                    thumbnail_url=convert_path_to_url(item.get('thumbnailPath'), http_request),
                    category=item.get('category', '기타'),
                    relevance_score=item.get('relevance_score', 0.05)
                )
            )
        
        return RAGRecommendationResponse(
            summary=summary,
            reasoning=reasoning,
            items=response_items,
            total_items=len(similar_item_ids),
            reranked=request.enable_rerank,
            llm_model=request.llm_model if request.enable_rerank else None,
            search_strategy=search_strategy
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.2-balanced",
        "qdrant": "active" if qdrant_client else "inactive",
        "llm": "active" if MISTRAL_API_KEY else "inactive"
    }


@app.get("/api/cache/clear")
async def clear_cache():
    global reranking_cache
    count = len(reranking_cache)
    reranking_cache.clear()
    return {"cleared": count}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)