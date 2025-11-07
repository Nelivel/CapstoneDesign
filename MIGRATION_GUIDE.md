# 기능 마이그레이션 가이드

## 개요
관리자, 신고, 알람 기능을 새 프로젝트로 옮기기 위한 체계적인 가이드입니다.

### 📊 현재 상태 (2025-11-04)
- ✅ **PostgreSQL 마이그레이션 완료** (MySQL → PostgreSQL)
- ✅ **JWT/Security 비활성화 완료** (테스트 환경 구축)
- ✅ **ReportController 활성화 완료** (TokenService 의존성 해결)
- 🔄 **마이그레이션 준비 완료** - 새 프로젝트로 이동 가능

---

## 1. 신고(Report) 기능 마이그레이션

### 📁 필요한 파일 목록

#### Domain Layer
- [ ] `domain/Report.java` - 신고 엔티티
- [ ] `domain/Ejection.java` - 강제퇴장 엔티티
- [ ] `domain/Enum/ReportStatus.java` - 신고 상태 Enum
- [ ] `domain/Enum/ReportType.java` - 신고 사유 Enum

#### Repository Layer
- [ ] `repository/ReportRepository.java`
- [ ] `repository/EjectionRepository.java`

#### Service Layer
- [ ] `service/ReportService.java`
- [ ] `service/EjectionService.java`

#### Controller Layer
- [x] `controller/ReportController.java` ✅ **활성화 완료** (TokenService → JWTUtil 변경 완료)
- [ ] `controller/EjectionController.java`

#### DTO Layer
- [ ] `dto/Report/ReportPostRequestDTO.java`
- [ ] `dto/Report/ReportPostResponseDTO.java`
- [ ] `dto/Report/ReportReplyRequestDTO.java`
- [ ] `dto/Report/ReportReplyResponseDTO.java`
- [ ] `dto/Report/ReportPagingRequestDTO.java`

### 🔗 의존성 확인
신고 기능이 의존하는 다른 엔티티:
- `User` - 신고자, 관리자
- `Post` - 게시글 신고 대상
- `Reply` - 댓글 신고 대상

---

## 2. 관리자(Admin) 기능 마이그레이션

### 📁 필요한 파일 목록

#### Domain Layer
- [ ] `domain/Enum/Role.java` - USER, ADMIN 권한 Enum
- [ ] `domain/User.java` - role 필드 확인

#### Service Layer
- [ ] Admin 관련 서비스 메서드들 (UserService 내부)
  - 사용자 강제 퇴장
  - 신고 처리
  - 사용자 권한 변경

#### Controller Layer
- [ ] Admin 전용 엔드포인트들
  - 신고 관리 (ReportController)
  - 회원 강제퇴장 (EjectionController)

### 🔒 권한 체크
- Spring Security에서 `ROLE_ADMIN` 권한 체크 로직
- `@PreAuthorize("hasRole('ADMIN')")` 어노테이션

---

## 3. 알람(Alarm/Notification) 기능 마이그레이션

### ⚠️ 현재 상태
검색 결과 알람 관련 엔티티나 컨트롤러가 **발견되지 않음**.
- 알람 기능이 아직 구현되지 않았거나
- 다른 이름으로 구현되어 있을 수 있음

### 💡 구현 필요 항목 (새로 만들 경우)
- [ ] `domain/Notification.java` - 알람 엔티티
- [ ] `domain/Enum/NotificationType.java` - 알람 타입
- [ ] `repository/NotificationRepository.java`
- [ ] `service/NotificationService.java`
- [ ] `controller/NotificationController.java`
- [ ] DTO 클래스들

---

## 📋 마이그레이션 순서 (권장)

### Step 1: 준비 단계
```bash
# 1. 새 프로젝트 브랜치 생성
git checkout -b feature/add-admin-report

# 2. 현재 프로젝트 파일들을 별도 폴더에 백업
```

### Step 2: Enum 및 기본 Domain 복사
**순서가 중요합니다!**

1. **Enum 먼저 복사** (다른 클래스들이 의존)
   ```
   domain/Enum/Role.java
   domain/Enum/ReportStatus.java
   domain/Enum/ReportType.java
   ```

2. **Base Entity 확인**
   ```
   domain/BaseTimeEntity.java (created_at, updated_at)
   ```

3. **Domain Entity 복사**
   ```
   domain/Report.java
   domain/Ejection.java
   ```

### Step 3: Repository Layer 복사
```
repository/ReportRepository.java
repository/EjectionRepository.java
```

### Step 4: DTO Layer 복사
```
dto/Report/ 폴더 전체
dto/paging/PageResponseDTO.java (페이징용)
```

### Step 5: Service Layer 복사
```
service/ReportService.java
service/EjectionService.java
```

### Step 6: Controller Layer 복사
```
controller/ReportController.java (주석 제거 후)
controller/EjectionController.java
```

### Step 7: 패키지명 변경
- 현재: `com.example.microstone`
- 새 프로젝트 패키지명으로 **일괄 변경**
- IDE의 Refactor > Rename Package 기능 사용

### Step 8: Import 수정 및 컴파일 오류 해결
1. 빠진 의존성 추가 (build.gradle)
2. 존재하지 않는 클래스 참조 수정
3. 메서드 시그니처 변경사항 확인

### Step 9: Database 마이그레이션
```sql
-- 새 프로젝트 DB에 테이블 생성
-- JPA가 자동 생성하거나 직접 생성

CREATE TABLE report (...);
CREATE TABLE ejection (...);
```

### Step 10: 테스트
1. 단위 테스트 작성
2. 통합 테스트
3. API 테스트 (Postman 등)

---

## 🛠️ 자동화 스크립트 (선택사항)

### 파일 복사 스크립트 예시
```bash
#!/bin/bash

SOURCE_PROJECT="c:/Microstone_Lagecy/microstone"
TARGET_PROJECT="c:/MyNewProject"

# Enum 복사
cp "$SOURCE_PROJECT/src/main/java/com/example/microstone/domain/Enum/Role.java" \
   "$TARGET_PROJECT/src/main/java/com/mynew/package/domain/Enum/"

# ... (나머지 파일들)
```

---

## ⚠️ 주의사항

### 1. 패키지 의존성
- 새 프로젝트에 없는 Util 클래스들 확인
- ~~`TokenService`~~ → **해결됨**: `JWTUtil` 사용으로 대체
- `EnumCastingUtil` 확인 필요

### 2. Security 설정
- 현재 프로젝트는 JWT + Spring Security 비활성화 상태 (테스트용)
- 새 프로젝트에서 권한 체크 로직 재확인 필요
- JWT 인증 활성화 시 필터 재설정 필요

### 3. Database
- MySQL → PostgreSQL 마이그레이션 완료 상태
- 새 프로젝트 DB 설정 확인

### 4. ~~주석 처리된 코드~~ → **해결됨**
- `ReportController.java` 활성화 완료
- TokenService → JWTUtil로 변경 완료
- `getUserIdFromToken()` 헬퍼 메서드 추가됨

---

## 🔍 각 파일별 체크리스트

### ReportController.java 활성화시 ✅ 완료
- [x] ~~TokenService 구현체 확인/생성~~ → JWTUtil 사용
- [x] ~~`getUidFromToken()` 메서드 구현~~ → `getUserIdFromToken()` 구현됨
- [x] JWT 토큰에서 user_id 추출 로직 완료

**구현된 내용:**
```java
private Long getUserIdFromToken(String token) {
    if (token == null || !token.startsWith("Bearer ")) {
        throw new IllegalArgumentException("Invalid token format");
    }
    String accessToken = token.substring(7);
    Map<String, Object> claims = jwtUtil.validateToken(accessToken);
    String userId = claims.get("user_id").toString();
    return Long.parseLong(userId);
}
```

### Report.java Entity
- [ ] User, Post, Reply 엔티티 존재 확인
- [ ] BaseTimeEntity 상속 확인
- [ ] FetchType 전략 검토

### ReportService.java
- [ ] 페이징 로직 확인
- [ ] 트랜잭션 처리 확인
- [ ] 예외 처리 전략

---

## 📝 마이그레이션 체크리스트

### 신고 기능
- [ ] Domain 복사 완료
- [ ] Repository 복사 완료
- [ ] Service 복사 완료
- [ ] Controller 복사 완료
- [ ] DTO 복사 완료
- [ ] 컴파일 오류 해결
- [ ] 테스트 작성
- [ ] API 동작 확인

### 관리자 기능
- [ ] Role Enum 확인
- [ ] Admin 권한 체크 로직
- [ ] Security 설정
- [ ] 테스트

### 알람 기능
- [ ] 요구사항 정의
- [ ] 설계
- [ ] 구현
- [ ] 테스트

---

## 💡 추천 도구

1. **IntelliJ IDEA**
   - Copy/Paste with Refactoring
   - Package Rename
   - Find Usages

2. **Git**
   - Feature Branch
   - Commit 단계별 진행

3. **Database Tool**
   - DBeaver
   - pgAdmin (PostgreSQL)

---

## 📞 문제 발생시

1. **컴파일 오류**
   - Missing imports → 해당 파일도 복사
   - Cannot resolve symbol → 패키지명 확인

2. **런타임 오류**
   - Bean creation failed → 순환 의존성 확인
   - Table not found → DDL 설정 확인

3. **비즈니스 로직 오류**
   - 로그 확인
   - 디버거 사용
   - 단위 테스트로 격리

---

## 🎯 결론

**가장 안전한 방법:**
1. 작은 단위로 나눠서 이동
2. 각 단계마다 컴파일 + 테스트
3. Git commit으로 롤백 포인트 만들기

**소요 시간 예상:**
- 신고 기능: 2-4시간
- 관리자 기능: 1-2시간
- 알람 기능 (신규): 4-8시간

---

## 📝 빠른 참조 - 변경 내역

### 최근 변경사항 (2025-11-04)

#### 1. ReportController.java 수정
**변경 전:**
```java
import org.springframework.security.core.token.TokenService;

@Autowired
private TokenService tokenService;

Long reporter_id = tokenService.getUidFromToken(token);
```

**변경 후:**
```java
import com.example.microstone.security.util.JWTUtil;

private final JWTUtil jwtUtil;

Long reporter_id = getUserIdFromToken(token);

// Helper method 추가
private Long getUserIdFromToken(String token) {
    if (token == null || !token.startsWith("Bearer ")) {
        throw new IllegalArgumentException("Invalid token format");
    }
    String accessToken = token.substring(7);
    Map<String, Object> claims = jwtUtil.validateToken(accessToken);
    String userId = claims.get("user_id").toString();
    return Long.parseLong(userId);
}
```

#### 2. 환경 설정 변경
- **Database**: MySQL → PostgreSQL
- **Security**: JWT 필터 비활성화 (`@Component` 주석 처리)
- **인증**: `permitAll()` 모든 요청 허용

#### 3. API 엔드포인트 (신고 기능)
```
POST   /api/reports/posts           - 게시글 신고
POST   /api/reports/replies         - 댓글 신고
PUT    /api/reports/status/{id}     - 신고 상태 변경 (관리자)
POST   /api/reports/paging          - 신고 목록 페이징
```

#### 4. 필수 의존성
- `JWTUtil` - JWT 토큰 처리
- `ReportService` - 신고 비즈니스 로직
- `EnumCastingUtil` - Enum 변환 (확인 필요)
- `ReplyRepository` - 댓글 신고 처리

---

## 🚀 마이그레이션 시작하기

### Quick Start
```bash
# 1. 새 브랜치 생성
git checkout -b feature/add-report-system

# 2. Enum 먼저 복사 (의존성이 가장 낮음)
cp domain/Enum/*.java [새프로젝트]/domain/Enum/

# 3. Domain Entity 복사
cp domain/Report.java domain/Ejection.java [새프로젝트]/domain/

# 4. Repository → Service → Controller 순서대로
# ... (가이드 본문 참조)

# 5. 패키지명 변경 (IntelliJ: Refactor > Rename Package)

# 6. 컴파일 & 테스트
./gradlew build
```

### 체크포인트
- [ ] 모든 파일 복사 완료
- [ ] 패키지명 변경 완료
- [ ] Import 오류 해결
- [ ] 컴파일 성공
- [ ] 데이터베이스 테이블 생성 확인
- [ ] API 테스트 성공
- [ ] Git 커밋 완료
