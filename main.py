"""
통합 API 서버 - 시간표 + 추천 시스템
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# 라우터 임포트
TIMETABLE_AVAILABLE = False
RECOMMENDATION_AVAILABLE = False

try:
    from timetable_api import router as timetable_router
    TIMETABLE_AVAILABLE = True
except ImportError:
    print("⚠️  timetable_api를 찾을 수 없습니다. 시간표 기능 비활성화")

# recommendation_api 또는 recommendation_api_with_images 시도
try:
    from recommendation_api import router as recommendation_router
    RECOMMENDATION_AVAILABLE = True
    print("✅ recommendation_api.py 로드 성공")
except ImportError:
    try:
        from recommendation_api_with_images import router as recommendation_router
        RECOMMENDATION_AVAILABLE = True
        print("✅ recommendation_api_with_images.py 로드 성공")
    except ImportError:
        print("⚠️  추천 API를 찾을 수 없습니다. 추천 기능 비활성화")


# Lifespan 이벤트 (on_event 대신 사용)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("\n" + "="*60)
    print("통합 API 서버 시작")
    print("="*60)
    print(f"시간표 API: {'✅ 활성' if TIMETABLE_AVAILABLE else '❌ 비활성'}")
    print(f"추천 API: {'✅ 활성' if RECOMMENDATION_AVAILABLE else '❌ 비활성'}")
    print(f"이미지 Static: {'✅ 활성' if os.path.exists(IMAGE_DIR) else '❌ 비활성'}")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown (필요시)
    print("\n서버 종료 중...")


# 이미지 디렉토리
IMAGE_DIR = "/mnt/sdb-data/daangn_images"

# FastAPI 앱 생성 (lifespan 사용)
app = FastAPI(
    title="통합 API 서버",
    version="2.1.0",
    description="시간표 분석 + 추천 시스템 통합 서버 (이미지 포함)",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 구체적으로 설정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 이미지 Static Files 마운트
try:
    if os.path.exists(IMAGE_DIR):
        app.mount(
            "/static/images", 
            StaticFiles(directory=IMAGE_DIR), 
            name="images"
        )
        print(f"✅ Static files mounted: /static/images -> {IMAGE_DIR}")
    else:
        print(f"⚠️  이미지 디렉토리 없음: {IMAGE_DIR}")
except Exception as e:
    print(f"❌ Static files mount 실패: {e}")

# 라우터 등록
if TIMETABLE_AVAILABLE:
    app.include_router(
        timetable_router, 
        prefix="/timetable", 
        tags=["시간표"]
    )
    print("✅ 시간표 API 등록 완료")

if RECOMMENDATION_AVAILABLE:
    app.include_router(
        recommendation_router, 
        prefix="/api", 
        tags=["추천"]
    )
    print("✅ 추천 API 등록 완료")


# 루트 엔드포인트
@app.get("/")
def root():
    """API 정보"""
    services = {}
    
    if TIMETABLE_AVAILABLE:
        services["시간표 분석"] = "/timetable"
    if RECOMMENDATION_AVAILABLE:
        services["추천 시스템"] = "/api/recommend"
    
    return {
        "name": "통합 API 서버",
        "version": "2.1.0",
        "services": services,
        "static_images": "/static/images" if os.path.exists(IMAGE_DIR) else None,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """전체 헬스 체크"""
    services_status = {}
    
    if TIMETABLE_AVAILABLE:
        services_status["timetable"] = "running"
    if RECOMMENDATION_AVAILABLE:
        services_status["recommendation"] = "running"
    
    return {
        "status": "healthy",
        "services": services_status,
        "static_images": os.path.exists(IMAGE_DIR)
    }


if __name__ == "__main__":
    import uvicorn
    
    # 개발 서버 실행
    # reload=True 사용 시 "main:app" 형식으로 실행해야 함
    uvicorn.run(
        "main:app",  # 문자열로 전달 (reload 모드용)
        host="0.0.0.0", 
        port=8000,
        reload=True
    )