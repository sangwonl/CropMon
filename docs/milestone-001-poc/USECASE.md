## 마일스톤1 목표

1. 스크린레코딩 + 인코딩 핵심 동작을 확인한다.
2. Electron with Redux & Clean Architecture의 기반 코드를 마련한다.

## 유스케이스

#### 필수

- PrepareCapture
  캡쳐 대상 좌표, 윈도우, 전체 화면 및 기타 설정 등을 선택하는 과정인데 마일스톤1에서는 별다른 옵션은 없고 항상 전체화면 대상으로 한다.

- StartCapture
  위의 Prepare 과정이 완료되면 실제 레코딩을 시작한다. 마일스톤1에서는 PrepareCapture 후에 자동으로 바로 들어가도록 한다.

- StopCapture
  레코딩을 완료하고 인코딩된 파일을 만들어냄으로써 캡쳐의 한 사이클을 완료한다.

#### 선택

- PauseCapture
  레코딩을 일시정지하는건데 일단 옵셔널로 보고 있지만 넣어둔다.
