# Quario Feature Specification

Last updated: 2026-07-03
Status: Draft

## 1. Product Scope

Quario는 크로스 플랫폼 범용 데이터베이스 클라이언트다. 핵심 목표는 여러 종류의 데이터베이스를 하나의 가벼운 데스크톱 앱에서 연결, 탐색, 쿼리 실행, 결과 확인할 수 있게 하는 것이다.

우선순위는 다음과 같다.

1. 낮은 메모리 사용량
2. 빠른 실행과 응답성
3. 다중 DB를 일관된 UX로 다루는 구조
4. 쿼리/명령 실행 중심의 안전한 MVP
5. 나중에 시각적 데이터 편집으로 확장 가능한 설계

## 2. MVP Scope

MVP에서 지원하는 데이터베이스는 다음과 같다.

- PostgreSQL
- MySQL
- SQLite
- Redis
- MongoDB

MVP의 핵심 사용 흐름은 다음과 같다.

1. 연결 프로필 생성
2. 직접 연결 또는 SSH 터널링으로 DB 연결
3. 연결 하위 Tree에서 DB 목록과 Table/Collection/Key 목록 확인
4. CodeMirror 기반 에디터에서 SQL, Redis command, Mongo JSON command/aggregation 실행
5. 결과를 virtualized grid 또는 JSON 형태로 확인
6. 실행 히스토리와 저장 쿼리를 관리
7. 결과를 CSV 또는 JSON으로 export

MVP에서는 시각적 데이터 편집 UI를 제공하지 않는다. 데이터 변경은 에디터에서 작성한 쿼리 또는 명령 실행으로만 지원한다.

## 3. Layout Specification

기본 레이아웃은 좌측 Connection Tree와 우측 작업 영역으로 구성한다.

화면은 크게 5개 영역으로 나뉜다.

1. Connection Tree 영역
2. Tab 영역
3. SQL / Redis command / Mongo Script Editor 영역
4. 조회된 데이터 Result 영역
5. Console 출력 영역

영역 배치는 다음과 같다.

```text
+----------------+----------------------------------+
| Connection     | Tabs                             |
| Tree           +----------------------------------+
|                | Editor                           |
|                |                                  |
|                +----------------------------------+
|                | Result Grid / Result Viewer      |
|                |                                  |
|                +----------------------------------+
|                | Console                          |
+----------------+----------------------------------+
```

레이아웃 규칙은 다음과 같다.

- Connection Tree는 좌측 고정 패널로 시작한다.
- 우측 작업 영역은 상단부터 Tab, Editor, Result, Console 순서로 배치한다.
- Connection Tree와 우측 작업 영역 사이의 세로 경계는 resize 가능해야 한다.
- Editor, Result, Console 사이의 가로 경계는 resize 가능해야 한다.
- resize handle은 실제 pointer hit area를 4px로 유지하되, 화면에 보이는 선은 1px로 표시한다.
- 각 영역은 최소 크기를 가져야 하며, 최소 크기 이하로 줄어들면 overflow 또는 collapse 정책을 적용한다.
- 주요 영역 내부에는 layout padding을 두지 않는다.
- border-radius는 버튼, 토글, 입력 필드 같은 interactive control에만 사용한다.
- 사용자가 조정한 패널 크기는 로컬에 저장해 앱 재시작 후 복원한다.
- 기본 테마는 Light와 Dark를 제공한다.

## 4. MVP Features

### F01. Connection Management

사용자는 DB 연결 프로필을 생성, 수정, 삭제할 수 있다.

연결 프로필은 DB 종류별로 필요한 값을 가진다.

- Profile name
- Environment
- Color
- Database type
- Host
- Port
- User
- Password
- Database name 또는 초기 접속 대상
- SSL/TLS 옵션
- SSH 터널링 옵션

SQLite는 파일 선택 기반 연결을 지원한다.

Environment 기본 옵션은 다음과 같다.

- local
- develop
- staging
- production
- custom

custom을 선택하면 사용자가 environment label을 직접 입력할 수 있다.

Color는 연결 식별용 environment color다. 사용자가 색상을 지정하면 Connection Tree node의 background color와 해당 연결의 쿼리 탭에 같은 색상 계열의 표시를 적용한다.

Color는 custom color picker를 제공하지 않고, 약 10개의 pastel preset palette 중 하나를 선택하게 한다.

민감정보는 연결 프로필에 직접 저장하지 않고 OS Keychain에 저장한다.

### F02. SSH Tunneling

연결 생성 화면에는 Over SSH 버튼 또는 토글을 제공한다.

Over SSH가 활성화되면 collapse되어 있던 SSH 입력 영역을 노출한다.

SSH 입력 필드는 다음과 같다.

- Host
- Port
- User
- Password
- SSH Key file
- Passphrase

인증 규칙은 다음과 같다.

- SSH Key가 비어 있으면 User + Password로 SSH password 인증을 시도한다.
- SSH Key가 있으면 User + SSH Key로 key 인증을 시도한다.
- SSH Key가 있는 경우 Password는 사용하지 않는다.
- SSH Key passphrase는 Passphrase 필드에서 별도로 입력받는다.

SSH 터널 연결 실패 시 DB 연결 실패와 구분되는 에러를 표시한다.

### F03. Secret Storage

DB password, SSH password, SSH key passphrase는 OS Keychain 계층에 저장한다.

플랫폼별 저장소는 다음을 기준으로 한다.

- macOS: Keychain
- Windows: Credential Manager
- Linux: Secret Service 호환 저장소

앱 로컬 저장소에는 secret value가 아니라 secret lookup key만 저장한다.

### F04. Multi-Connection Workspace

사용자는 여러 DB 연결을 동시에 열 수 있다.

각 연결은 Connection Tree의 최상위 노드로 표시된다.

각 연결은 여러 쿼리 탭을 가질 수 있다.

연결에 color가 지정된 경우 해당 연결에서 열린 모든 탭은 같은 connection color를 식별 요소로 표시한다.

탭은 연결 컨텍스트를 가진다.

- 어떤 연결에서 실행되는지
- 어떤 DB 또는 schema를 대상으로 하는지
- 어떤 에디터 모드인지
- 어떤 environment와 color를 가진 연결인지

### F05. Database Explorer Tree

Connection Tree는 VSCode file tree 스타일의 접힘/펼침 가능한 tree로 구성하고, 연결 하위에 DB 목록과 객체 목록을 표시한다.

연결 최상위 노드는 profile name, environment, connection color를 표시한다.

MVP에서 표시할 메타데이터는 다음과 같다.

PostgreSQL, MySQL, SQLite:

- Database 또는 schema
- Table
- Column
- Primary key
- Index

MongoDB:

- Database
- Collection
- Index

Redis:

- Database index
- Key
- Key type

고급 객체는 Later로 분리한다.

- View
- Function
- Trigger
- Procedure
- Constraint 상세
- Redis Stream 상세 탐색

### F06. Query / Command Editor

에디터는 CodeMirror 기반으로 구현한다.

DB별 입력 방식은 다음과 같다.

- PostgreSQL, MySQL, SQLite: SQL
- Redis: Redis CLI command 형식
- MongoDB: JSON command 및 aggregation pipeline 중심

MVP 에디터 기능은 다음과 같다.

- Syntax highlighting
- Execute current statement 또는 selection
- Execute all
- Basic autocomplete 후보 표시
- Query tab별 unsaved state 표시
- Dirty state 확인 후 닫기

### F07. Query Execution

사용자는 에디터에서 쿼리 또는 명령을 실행할 수 있다.

실행 결과는 다음 유형으로 구분한다.

- Result set
- Affected rows
- Command response
- Error
- Execution metadata

Execution metadata에는 다음을 포함한다.

- 시작 시간
- 실행 시간
- 대상 연결
- 대상 DB/schema
- row count
- error code 또는 driver error

장시간 실행 쿼리는 cancel할 수 있어야 한다.

### F08. Result Grid / Result Viewer

조회 결과는 기본적으로 virtualized grid로 표시한다.

MVP 결과 표시 정책은 다음과 같다.

- 기본 row limit 적용
- 페이지네이션 제공
- 컬럼 resize 지원
- 컬럼 정렬은 클라이언트 결과 범위 내에서만 지원
- NULL, binary, JSON 등 타입별 기본 표시 제공
- MongoDB 결과는 JSON document viewer를 기본 표시로 사용한다. 배열 형태 결과가 grid로 표현 가능한 경우에만 table 표시를 보조 제공한다.
- Redis 결과는 command response 형태에 맞춰 scalar, list, table, structured JSON 중 하나로 표시한다.

대용량 cursor/streaming 처리는 Later로 분리한다.

### F09. Console Output

Console 영역은 쿼리 실행 로그와 시스템 메시지를 표시한다.

표시 대상은 다음과 같다.

- Connection status
- SSH tunneling status
- Query started
- Query completed
- Query failed
- Execution time
- Affected rows
- Export status

Console은 사용자가 복사할 수 있어야 한다.

### F10. Query History

앱은 최근 실행한 쿼리와 명령을 자동 저장한다.

히스토리 항목은 다음 정보를 가진다.

- 실행 시각
- DB type
- Connection profile reference
- Query text 또는 command text
- Execution status
- Execution time

MVP는 쿼리 본문 자동 redaction을 제공하지 않는다. 히스토리는 로컬에만 저장하며, 사용자는 히스토리 저장을 끌 수 있어야 한다.

### F11. Saved Queries

사용자는 자주 쓰는 쿼리 또는 명령을 이름 붙여 저장할 수 있다.

MVP 저장 쿼리 기능은 다음과 같다.

- 저장
- 이름 변경
- 삭제
- 현재 탭으로 열기
- 현재 연결에서 실행

폴더, 태그, 공유 기능은 Later로 분리한다.

### F12. Export

결과 export는 CSV와 JSON을 지원한다.

MVP export 정책은 다음과 같다.

- SQL result set: CSV, JSON
- MongoDB result: JSON
- Redis result: JSON

Excel export는 Later로 분리한다.

### F13. Error Handling & Diagnostics

에러는 사용자가 다음 행동을 판단할 수 있게 표시해야 한다.

에러 카테고리는 다음과 같다.

- Connection error
- SSH tunnel error
- Authentication error
- Permission error
- Query syntax error
- Query execution error
- Timeout
- Export error
- Secret storage error

상세 driver error는 접을 수 있는 detail 영역에 표시한다.

## 5. Later Features

- Visual Data Editing
- Advanced Redis Structure Editor
- Mongo Document Editor
- MSSQL Support
- Oracle Support
- DynamoDB Support
- Advanced SSH Options
- Workspace / Project Mode
- Excel Export
- Advanced Metadata Objects

## 6. Open Decisions

아래 항목은 아직 확정이 필요하다.

1. 앱 로컬 저장소 형식: SQLite 또는 파일 기반 JSON
2. 기본 row limit 값
3. query timeout 기본값
4. MongoDB JSON command 문법의 정확한 입력 포맷
5. Redis multi-command 실행 허용 여부
6. 저장 쿼리의 연결 종속 여부
7. 히스토리 보관 기간 또는 최대 개수
8. 결과 export 시 파일 인코딩 기본값
9. 패널 최소 크기와 collapse 정책
10. 히스토리 저장 기본값: 기본 활성화 또는 기본 비활성화

## 7. Non-Goals For MVP

MVP에서는 다음을 하지 않는다.

- 시각적 데이터 편집 UI
- Excel export
- MSSQL, Oracle, DynamoDB 지원
- workspace/project mode
- DB schema migration 도구
- ERD 생성
- 쿼리 성능 분석기
- 협업/공유 기능
- cloud sync
