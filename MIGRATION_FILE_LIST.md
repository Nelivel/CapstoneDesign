# 마이그레이션 정확한 파일 목록

## 📦 복사해야 할 파일 전체 목록

### 1️⃣ 신고(Report) 기능 - 12개 파일

#### Domain Layer (3개)
```
src/main/java/com/example/microstone/domain/Report.java
src/main/java/com/example/microstone/domain/Enum/ReportStatus.java
src/main/java/com/example/microstone/domain/Enum/ReportType.java
```

#### Repository Layer (1개)
```
src/main/java/com/example/microstone/repository/ReportRepository.java
```

#### Service Layer (1개)
```
src/main/java/com/example/microstone/service/ReportService.java
```

#### Controller Layer (1개)
```
src/main/java/com/example/microstone/controller/ReportController.java
```

#### DTO Layer (6개)
```
src/main/java/com/example/microstone/dto/Report/ReportPagingRequestDTO.java
src/main/java/com/example/microstone/dto/Report/ReportPostRequestDTO.java
src/main/java/com/example/microstone/dto/Report/ReportPostResponseDTO.java
src/main/java/com/example/microstone/dto/Report/ReportReplyRequestDTO.java
src/main/java/com/example/microstone/dto/Report/ReportReplyResponseDTO.java
src/main/java/com/example/microstone/dto/Report/ReportResponseDTO.java
```

---

### 2️⃣ 강제퇴장(Ejection) 기능 - 5개 파일

#### Domain Layer (1개)
```
src/main/java/com/example/microstone/domain/Ejection.java
```

#### Repository Layer (1개)
```
src/main/java/com/example/microstone/repository/EjectionRepository.java
```

#### Service Layer (1개)
```
src/main/java/com/example/microstone/service/EjectionService.java
```

#### Controller Layer (1개)
```
src/main/java/com/example/microstone/controller/EjectionController.java
```

#### DTO Layer (1개)
```
src/main/java/com/example/microstone/dto/EjectionRequestDTO.java
```

---

### 3️⃣ 공통 의존성 파일 - 5개 파일

#### Base Entity (1개)
```
src/main/java/com/example/microstone/domain/BaseTimeEntity.java
```

#### Utility (1개)
```
src/main/java/com/example/microstone/util/EnumCastingUtil.java
```

#### Paging DTO (1개)
```
src/main/java/com/example/microstone/dto/paging/PageResponseDTO.java
```

#### 관리자 권한 관련 Enum (2개)
```
src/main/java/com/example/microstone/domain/Enum/Role.java
src/main/java/com/example/microstone/domain/Enum/Department.java (선택사항)
src/main/java/com/example/microstone/domain/Enum/Occupation.java (선택사항)
```

---

### 4️⃣ JWT 관련 (새 프로젝트에 없다면 필요)

```
src/main/java/com/example/microstone/security/util/JWTUtil.java
```

---

## 📊 요약

| 기능 | 파일 수 | 비고 |
|------|---------|------|
| 신고(Report) | 12개 | ✅ 완전 구현 |
| 강제퇴장(Ejection) | 5개 | ✅ 완전 구현 |
| 공통 의존성 | 3-5개 | 필수 + 선택 |
| **합계** | **20-22개** | |

---

## 🎯 복사 순서 (권장)

### Phase 1: 기반 파일 (의존성 없음)
1. `BaseTimeEntity.java`
2. `EnumCastingUtil.java`
3. `PageResponseDTO.java`
4. `Role.java`, `ReportStatus.java`, `ReportType.java` (모든 Enum)

### Phase 2: Domain Entity
5. `Report.java`
6. `Ejection.java`

### Phase 3: Repository
7. `ReportRepository.java`
8. `EjectionRepository.java`

### Phase 4: DTO
9. `dto/Report/*.java` (6개 파일 전체)
10. `EjectionRequestDTO.java`

### Phase 5: Service
11. `ReportService.java`
12. `EjectionService.java`

### Phase 6: Controller
13. `ReportController.java` ✅ (이미 수정 완료)
14. `EjectionController.java`

### Phase 7: JWT (필요시)
15. `JWTUtil.java`

---

## 💻 복사 명령어 (Windows)

```powershell
# 변수 설정
$SOURCE = "c:\Microstone_Lagecy\microstone\src\main\java\com\example\microstone"
$TARGET = "c:\YourNewProject\src\main\java\com\yournew\package"

# Phase 1: 기반 파일
Copy-Item "$SOURCE\domain\BaseTimeEntity.java" "$TARGET\domain\"
Copy-Item "$SOURCE\util\EnumCastingUtil.java" "$TARGET\util\"
Copy-Item "$SOURCE\dto\paging\PageResponseDTO.java" "$TARGET\dto\paging\"

# Phase 2: Enum
Copy-Item "$SOURCE\domain\Enum\Role.java" "$TARGET\domain\Enum\"
Copy-Item "$SOURCE\domain\Enum\ReportStatus.java" "$TARGET\domain\Enum\"
Copy-Item "$SOURCE\domain\Enum\ReportType.java" "$TARGET\domain\Enum\"

# Phase 3: Domain
Copy-Item "$SOURCE\domain\Report.java" "$TARGET\domain\"
Copy-Item "$SOURCE\domain\Ejection.java" "$TARGET\domain\"

# Phase 4: Repository
Copy-Item "$SOURCE\repository\ReportRepository.java" "$TARGET\repository\"
Copy-Item "$SOURCE\repository\EjectionRepository.java" "$TARGET\repository\"

# Phase 5: DTO
Copy-Item "$SOURCE\dto\Report" "$TARGET\dto\" -Recurse
Copy-Item "$SOURCE\dto\EjectionRequestDTO.java" "$TARGET\dto\"

# Phase 6: Service
Copy-Item "$SOURCE\service\ReportService.java" "$TARGET\service\"
Copy-Item "$SOURCE\service\EjectionService.java" "$TARGET\service\"

# Phase 7: Controller
Copy-Item "$SOURCE\controller\ReportController.java" "$TARGET\controller\"
Copy-Item "$SOURCE\controller\EjectionController.java" "$TARGET\controller\"
```

---

## 🔍 복사 전 체크리스트

### 새 프로젝트에 이미 존재하는지 확인
- [ ] `User` Entity (Report, Ejection이 참조함)
- [ ] `Post` Entity (Report이 참조함)
- [ ] `Reply` Entity (Report이 참조함)
- [ ] `JWTUtil` (ReportController가 사용함)
- [ ] `ReplyRepository` (ReportController가 사용함)

### 존재하지 않으면 추가로 복사 필요
```
src/main/java/com/example/microstone/domain/User.java
src/main/java/com/example/microstone/domain/Post.java
src/main/java/com/example/microstone/domain/Reply.java
src/main/java/com/example/microstone/repository/ReplyRepository.java
src/main/java/com/example/microstone/security/util/JWTUtil.java
```

---

## ⚠️ 복사 후 필수 작업

### 1. 패키지명 변경
```
com.example.microstone → com.yournewproject.package
```
**도구**: IntelliJ IDEA > Refactor > Rename Package

### 2. Import 자동 정리
**도구**: IntelliJ IDEA > Code > Optimize Imports (Ctrl+Alt+O)

### 3. 컴파일 확인
```bash
./gradlew build
```

### 4. 존재하지 않는 참조 해결
- Missing class errors → 해당 파일도 복사
- Cannot resolve method → 메서드 시그니처 확인

---

## 🚨 주의사항

### 1. 순환 의존성 방지
- Entity는 Service를 참조하면 안 됨
- Controller → Service → Repository → Entity 순서 유지

### 2. Enum 우선 복사
- 다른 클래스들이 Enum에 의존하므로 **반드시 먼저** 복사

### 3. DTO 패키지 구조 유지
```
dto/
├── Report/
│   ├── ReportPostRequestDTO.java
│   ├── ReportPostResponseDTO.java
│   ├── ReportReplyRequestDTO.java
│   ├── ReportReplyResponseDTO.java
│   ├── ReportPagingRequestDTO.java
│   └── ReportResponseDTO.java
├── paging/
│   └── PageResponseDTO.java
└── EjectionRequestDTO.java
```

---

## 📝 복사 진행 상황 체크리스트

### 신고 기능
- [ ] Domain (3개)
- [ ] Repository (1개)
- [ ] Service (1개)
- [ ] Controller (1개)
- [ ] DTO (6개)

### 강제퇴장 기능
- [ ] Domain (1개)
- [ ] Repository (1개)
- [ ] Service (1개)
- [ ] Controller (1개)
- [ ] DTO (1개)

### 공통
- [ ] BaseTimeEntity
- [ ] EnumCastingUtil
- [ ] PageResponseDTO
- [ ] Role Enum
- [ ] Report Enums (2개)

### 후처리
- [ ] 패키지명 변경
- [ ] Import 정리
- [ ] 컴파일 성공
- [ ] 테스트 작성
- [ ] API 테스트
- [ ] Git 커밋

---

## 📞 문제 발생시

### "Cannot resolve symbol User/Post/Reply"
→ 해당 Entity도 복사 필요

### "Cannot resolve method validateToken"
→ JWTUtil.java 복사 필요

### "Cannot find class EnumCastingUtil"
→ util/EnumCastingUtil.java 복사 필요

### "PageResponseDTO not found"
→ dto/paging/PageResponseDTO.java 복사 필요

---

**총 복사 파일: 20-22개**
**예상 소요 시간: 2-3시간** (복사 + 패키지 변경 + 테스트)
