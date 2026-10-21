export const FAQ_CATEGORIES = [
  { id: 'friend', label: '친구' },
  { id: 'report', label: '신고·공지' },
  { id: 'study', label: '학습·스터디' },
  { id: 'account', label: '계정·카메라' },
] as const;

export type FaqCategory = typeof FAQ_CATEGORIES[number]['id'];

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  action?: { label: string; to: string };
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'friend-code', category: 'friend', question: '친구 추가에 필요한 회원 코드는 어디서 확인하나요?',
    answer: '친구 추가 화면의 ‘내 코드’에서 본인의 코드를 확인할 수 있어요. 친구에게 코드를 전달받아 검색하고, 검색된 닉네임을 확인한 뒤 요청을 보내세요. 스터디룸 초대코드와 회원 코드는 서로 달라요.',
    action: { label: '친구 추가로 이동', to: '/friend/add' },
  },
  {
    id: 'friend-request', category: 'friend', question: '친구 요청을 받았는데 친구 목록에 보이지 않아요.',
    answer: '친구 요청은 수락한 뒤 친구 목록에 표시돼요. ‘받은 요청’에서 상대방을 확인하고 수락하거나 거절할 수 있어요. 보낸 요청의 상태는 ‘보낸 요청’에서 확인해주세요.',
    action: { label: '받은 요청 확인', to: '/friend/request' },
  },
  {
    id: 'friend-invite', category: 'friend', question: '친구에게 스터디 초대는 어떻게 전달하나요?',
    answer: '친구 목록 또는 마이페이지의 내 친구에서 ‘스터디 초대’를 누르세요. 방 이름과 공유를 허용받은 초대코드를 입력해 문구를 복사한 뒤, 메신저 등으로 직접 전달하면 돼요. 서비스에서 자동으로 전송되거나 상대방이 자동 가입되는 기능은 아니에요. 자동 복사가 안 되면 미리보기 문구를 직접 선택해 복사하세요.',
    action: { label: '친구 목록으로 이동', to: '/friend/list' },
  },
  {
    id: 'friend-delete', category: 'friend', question: '친구 삭제와 신고는 어떤 차이가 있나요?',
    answer: '친구 삭제는 친구 관계를 해제하는 기능이고, 신고는 운영자에게 문제 내용을 접수하는 기능이에요. 신고만으로 친구가 자동 삭제되지는 않아요. 친구 목록에서 원하는 기능을 선택해주세요.',
    action: { label: '친구 목록으로 이동', to: '/friend/list' },
  },
  {
    id: 'report-create', category: 'report', question: '신고는 어디서 접수하나요?',
    answer: '로그인 후 오른쪽 아래 + 메뉴의 ‘신고하기’에서 일반 신고를 접수할 수 있어요. 회원 프로필이나 친구 목록의 신고 버튼을 이용하면 해당 회원이 신고 대상으로 지정돼요. 신고 사유는 짧게 적고 상세 내용에 상황을 구체적으로 설명해주세요.',
    action: { label: '일반 신고 작성', to: '/reportCreate' },
  },
  {
    id: 'report-history', category: 'report', question: '내가 접수한 신고와 답변은 어디서 확인하나요?',
    answer: '마이페이지의 신고 내역에서 본인이 접수한 신고를 확인할 수 있어요. 신고 답변 목록에서도 답변이 등록된 신고를 확인할 수 있어요. 접수와 답변 등록은 서로 다른 단계이므로 답변이 바로 보이지 않을 수 있어요.',
    action: { label: '신고 답변 목록', to: '/reportReplyList' },
  },
  {
    id: 'notice-check', category: 'report', question: '공지사항과 서비스 변경 안내는 어디서 보나요?',
    answer: '홈의 최신 공지 배너를 누르거나 상단 공지사항 메뉴를 이용하세요. 공지 목록에서는 제목이나 내용으로 검색할 수 있어요.',
    action: { label: '공지사항 보기', to: '/notice' },
  },
  {
    id: 'study-image', category: 'study', question: '문제를 만들 학습 이미지는 어떻게 준비하면 좋나요?',
    answer: '교재나 노트의 글자가 선명하고 페이지가 바르게 보이도록 촬영해주세요. 그림자나 빛 반사, 잘린 문장을 피하고 필요한 학습 내용이 보이는 이미지를 선택하세요. 불필요한 개인정보가 포함되지 않았는지도 확인해주세요.',
    action: { label: '개인 스터디로 이동', to: '/selfStudy' },
  },
  {
    id: 'study-error', category: 'study', question: '이미지 업로드나 AI 문제 생성에 실패했어요.',
    answer: '화면의 오류 안내와 선택한 파일을 확인해주세요. 잠시 기다린 뒤 학습 기록에 결과가 남아 있는지 먼저 확인하고, 생성되지 않았다면 다시 시도하세요. 같은 작업을 연속으로 여러 번 누르지 말고, 문제가 계속되면 오류가 난 단계와 메시지를 적어 일반 신고로 문의해주세요.',
    action: { label: '개인 스터디로 이동', to: '/selfStudy' },
  },
  {
    id: 'study-invite-code', category: 'study', question: '스터디룸 초대코드로 입장할 수 없어요.',
    answer: '먼저 로그인한 뒤 스터디룸 화면의 ‘초대코드로 입장하기’에 코드를 입력하세요. 회원 코드와 혼동하지 않았는지, 문자를 빠뜨리지 않았는지 확인해주세요. 계속 실패하면 방장에게 현재 코드를 확인하고 방의 정원이나 가입 상태도 확인해주세요.',
    action: { label: '스터디룸으로 이동', to: '/group' },
  },
  {
    id: 'camera-permission', category: 'account', question: '카메라가 켜지지 않거나 권한을 거부했어요.',
    answer: '브라우저의 사이트 권한 설정에서 카메라 허용 여부를 확인하고, 다른 프로그램이 카메라를 사용 중인지 살펴보세요. 카메라 기능은 HTTPS 또는 localhost처럼 브라우저가 허용하는 환경에서 사용할 수 있어요. 카메라 없이 일반 학습 타이머를 이용해도 돼요.',
  },
  {
    id: 'focus-optional', category: 'account', question: '집중 학습을 꼭 사용해야 하나요?',
    answer: '집중 학습은 선택하는 보조 기능이에요. 일반 학습에서는 카메라 없이 타이머를 사용할 수 있어요. 집중 학습에서는 얼굴 또는 움직임이 2초간 연속 감지되면 타이머가 시작돼요. 서버가 5초 이상 미감지를 확인하면 자동으로 일시정지되고, 학습이 다시 2초간 연속 감지되면 자동 재개돼요. 직접 일시정지한 경우에는 재개 버튼을 눌러야 해요.',
  },
  {
    id: 'login-required', category: 'account', question: '친구나 스터디 화면에서 로그인 페이지로 이동해요.',
    answer: '친구, 신고, 개인·그룹 스터디는 로그인이 필요한 기능이에요. 로그인하면 요청했던 주소로 돌아갈 수 있어요. 로그인 갱신에 실패했다면 인터넷 연결을 확인하고 다시 로그인해주세요. 공지사항과 버디봇은 비회원도 이용할 수 있어요.',
  },
];
