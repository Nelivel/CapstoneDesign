"""
시간표 비교 API 라우터
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# 라우터 생성
router = APIRouter()


class TimetableAnalyzer:
    def __init__(self):
        self.days = ['월요일', '화요일', '수요일', '목요일', '금요일']
        self.start_hour = 9
        self.period_duration = 50
        self.break_duration = 10
    
    def get_period_time(self, period_index: int) -> Dict[str, str]:
        """교시를 시간으로 변환"""
        total_minutes = period_index * (self.period_duration + self.break_duration)
        hour = self.start_hour + total_minutes // 60
        minute = total_minutes % 60
        
        end_minute = minute + self.period_duration
        end_hour = hour + end_minute // 60
        final_end_minute = end_minute % 60
        
        return {
            'start': f"{hour:02d}:{minute:02d}",
            'end': f"{end_hour:02d}:{final_end_minute:02d}"
        }
    
    def find_common_free_time(self, timetable1: List[List[str]], 
                             timetable2: List[List[str]]) -> List[Dict[str, Any]]:
        """두 시간표에서 공통 빈 시간 찾기"""
        free_slots = []
        
        for day_idx in range(min(len(timetable1), len(timetable2))):
            day1 = timetable1[day_idx]
            day2 = timetable2[day_idx]
            min_length = min(len(day1), len(day2))
            
            for period_idx in range(min_length):
                if day1[period_idx] == 'x' and day2[period_idx] == 'x':
                    time_info = self.get_period_time(period_idx)
                    free_slots.append({
                        'day': self.days[day_idx],
                        'day_index': day_idx,
                        'period': period_idx + 1,
                        'time_range': f"{time_info['start']} - {time_info['end']}",
                        'start_time': time_info['start'],
                        'end_time': time_info['end']
                    })
        
        return free_slots
    
    def find_consecutive_free_blocks(self, free_slots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """연속된 빈 시간 블록 찾기"""
        if not free_slots:
            return []
        
        blocks = []
        current_block = None
        
        for slot in free_slots:
            if (current_block is None or 
                current_block['day_index'] != slot['day_index'] or 
                current_block['last_period'] != slot['period'] - 1):
                if current_block:
                    blocks.append(current_block)
                current_block = {
                    'day': slot['day'],
                    'day_index': slot['day_index'],
                    'start_period': slot['period'],
                    'last_period': slot['period'],
                    'start_time': slot['start_time'],
                    'end_time': slot['end_time'],
                    'duration': 1
                }
            else:
                current_block['last_period'] = slot['period']
                current_block['end_time'] = slot['end_time']
                current_block['duration'] += 1
        
        if current_block:
            blocks.append(current_block)
        
        return blocks
    
    def recommend_best_times(self, timetable1: List[List[str]], 
                            timetable2: List[List[str]], 
                            prefer_longer_blocks: bool = True,
                            min_duration: int = 1,
                            exclude_lunch_hour: bool = False) -> Dict[str, Any]:
        """최적 거래 시간 추천"""
        free_slots = self.find_common_free_time(timetable1, timetable2)
        
        if not free_slots:
            return {
                'success': False,
                'message': '두 사람의 공통 빈 시간이 없습니다.',
                'free_slots': [],
                'recommendations': []
            }
        
        filtered_slots = free_slots
        if exclude_lunch_hour:
            filtered_slots = [
                slot for slot in free_slots 
                if int(slot['start_time'].split(':')[0]) < 12 or 
                   int(slot['start_time'].split(':')[0]) >= 13
            ]
        
        blocks = self.find_consecutive_free_blocks(filtered_slots)
        valid_blocks = [block for block in blocks if block['duration'] >= min_duration]
        
        if prefer_longer_blocks:
            recommendations = sorted(valid_blocks, key=lambda x: x['duration'], reverse=True)
        else:
            recommendations = sorted(valid_blocks, key=lambda x: (x['day_index'], x['start_period']))
        
        enhanced_recommendations = []
        for block in recommendations:
            enhanced_recommendations.append({
                **block,
                'time_range': f"{block['start_time']} - {block['end_time']}",
                'duration_minutes': block['duration'] * 60,
                'description': f"{block['day']} {block['start_time']}-{block['end_time']} "
                              f"({block['duration']}교시, {block['duration'] * 60}분)"
            })
        
        return {
            'success': True,
            'total_free_slots': len(filtered_slots),
            'free_slots': filtered_slots,
            'recommendations': enhanced_recommendations
        }


# Pydantic 모델
class TimetableRequest(BaseModel):
    timetable1: List[List[str]]
    timetable2: List[List[str]]
    prefer_longer_blocks: Optional[bool] = True
    min_duration: Optional[int] = 1
    exclude_lunch_hour: Optional[bool] = False


# 전역 Analyzer 인스턴스
analyzer = TimetableAnalyzer()


@router.get("/")
def timetable_info():
    """시간표 API 정보"""
    return {
        "name": "Timetable Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze": "시간표 분석 및 추천"
        }
    }


@router.post("/analyze")
def analyze_timetable(request: TimetableRequest):
    """
    두 시간표를 비교하고 최적의 만남 시간 추천
    
    - **timetable1**: 첫 번째 사용자 시간표 (o: 수업, x: 빈 시간)
    - **timetable2**: 두 번째 사용자 시간표
    - **prefer_longer_blocks**: 긴 시간 우선 (기본: True)
    - **min_duration**: 최소 교시 수 (기본: 1)
    - **exclude_lunch_hour**: 점심시간 제외 (기본: False)
    """
    try:
        result = analyzer.recommend_best_times(
            timetable1=request.timetable1,
            timetable2=request.timetable2,
            prefer_longer_blocks=request.prefer_longer_blocks,
            min_duration=request.min_duration,
            exclude_lunch_hour=request.exclude_lunch_hour
        )
        
        # recommendations만 반환
        return result.get('recommendations', [])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """시간표 API 헬스 체크"""
    return {"status": "healthy", "service": "timetable"}