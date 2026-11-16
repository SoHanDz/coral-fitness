export type DayKey = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN'
export type DayType = 'strength' | 'walk' | 'rest'

export interface Exercise {
  id: string
  nameVi: string
  nameEn: string
  targetMuscle: string
  formCues: string[]
  safetyNote: string
  /** Optional custom path, e.g. '/gifs/my-file.gif'. Default: /gifs/{id}.gif */
  gif?: string
}

export interface PlanItem {
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
}

export interface DayPlan {
  key: DayKey
  label: string
  title: string
  type: DayType
  description?: string
  items?: PlanItem[]
}

export const DAY_KEYS: DayKey[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

/**
 * ===== THÊM BÀI TẬP MỚI Ở ĐÂY =====
 * Copy mẫu dưới đây, bỏ comment, điền thông tin, rồi dùng `id` trong `schedule` bên dưới.
 * GIF: thả file `{id}.gif` vào `public/gifs/` (hoặc đặt trường `gif` nếu tên file khác).
 *
 * {
 *   id: 'ten-bai-tap-viet-thuong',
 *   nameVi: 'Tên tiếng Việt',
 *   nameEn: 'English Name',
 *   targetMuscle: 'Nhóm cơ',
 *   formCues: ['Gợi ý 1', 'Gợi ý 2'],
 *   safetyNote: 'Lưu ý an toàn khớp',
 * },
 */
export const exercises: Record<string, Exercise> = Object.fromEntries(
  (
    [
      {
        id: 'floor-press',
        nameVi: 'Nằm sàn đẩy ngực 2 tay',
        nameEn: 'Dumbbell Floor Press',
        targetMuscle: 'Ngực & Tay sau',
        formCues: [
          'Nằm ngửa gập gối, hai tay cầm tạ',
          'Hạ cùi trỏ chạm nhẹ xuống sàn rồi đẩy thẳng lên',
          'Thở ra khi đẩy tạ lên',
        ],
        safetyNote: 'Sàn nhà giúp chặn biên độ hạ tạ, bảo vệ khớp vai tối đa.',
      },
      {
        id: 'bent-over-row',
        nameVi: 'Cúi người kéo tạ 2 tay',
        nameEn: 'Bent-Over Dumbbell Row',
        targetMuscle: 'Lưng giữa & Xô',
        formCues: [
          'Đứng chân rộng bằng vai, chùng nhẹ gối',
          'Đẩy hông ra sau, giữ lưng thẳng song song 45 độ',
          'Kéo cùi trỏ ép sát thân về phía hông',
        ],
        safetyNote: 'Luôn khóa thẳng lưng dưới, tuyệt đối không gù lưng.',
      },
      {
        id: 'seated-shoulder-press',
        nameVi: 'Ngồi ghế đẩy vai 2 tay',
        nameEn: 'Seated Dumbbell Shoulder Press',
        targetMuscle: 'Cơ vai',
        formCues: [
          'Ngồi thẳng lưng tựa ghế, đưa tạ ngang tai',
          'Đẩy thẳng hai tạ lên qua đầu',
          'Hạ chậm có kiểm soát về vị trí cũ',
        ],
        safetyNote: 'Không khóa cứng khớp cùi trỏ ở đỉnh động tác.',
      },
      {
        id: 'dead-bug',
        nameVi: 'Nằm ngửa duỗi tay chân chéo',
        nameEn: 'Dead Bug',
        targetMuscle: 'Cơ lõi (Core)',
        formCues: [
          'Nằm ngửa, giơ thẳng tay và gập gối 90 độ',
          'Duỗi chậm tay phải và chân trái sát sàn rồi đổi bên',
          'Hít thở đều suốt quá trình tập',
        ],
        safetyNote: 'Ép chặt vùng thắt lưng dính sát xuống sàn để bảo vệ cột sống.',
      },
      {
        id: 'chair-goblet-squat',
        nameVi: 'Squat tựa ghế giữ 1 tạ',
        nameEn: 'Chair Goblet Squat',
        targetMuscle: 'Đùi trước & Mông',
        formCues: [
          'Ôm 1 quả tạ sát trước ngực, đứng trước ghế chắc chắn',
          'Đẩy hông ra sau hạ mông chạm nhẹ mặt ghế',
          'Ấn mạnh gót chân siết đùi đứng dậy',
        ],
        safetyNote: 'Đầu gối mở hướng theo mũi chân, dùng ghế làm điểm tựa an toàn khớp gối.',
      },
      {
        id: 'glute-bridge',
        nameVi: 'Cầu mông nằm sàn',
        nameEn: 'Glute Bridge',
        targetMuscle: 'Cơ mông & Đùi sau',
        formCues: [
          'Nằm ngửa gập gối, hai bàn chân đặt phẳng trên sàn',
          'Ấn gót chân đẩy hông lên cao tạo đường thẳng',
          'Siết chặt mông 1 giây ở đỉnh rồi hạ xuống',
        ],
        safetyNote: 'Không ưỡn quá mức làm võng thắt lưng ở điểm cao nhất.',
      },
      {
        id: 'dumbbell-rdl',
        nameVi: 'Đẩy hông tạ đơn',
        nameEn: 'Dumbbell Romanian Deadlift',
        targetMuscle: 'Đùi sau & Mông',
        formCues: [
          'Đứng thẳng cầm 2 tạ trước đùi, gối hơi chùng nhẹ',
          'Đẩy hông ra sau, trượt tạ sát ống chân xuống qua gối',
          'Siết mông kéo người đứng thẳng dậy',
        ],
        safetyNote: 'Giữ tạ luôn sát chân và lưng phẳng như mặt bàn.',
      },
      {
        id: 'seated-calf-raise',
        nameVi: 'Ngồi ghế kiễng gót',
        nameEn: 'Seated Dumbbell Calf Raise',
        targetMuscle: 'Bắp chân',
        formCues: [
          'Ngồi thẳng trên ghế, đặt 2 quả tạ lên gần đầu gối',
          'Kiễng cao gót chân hết cỡ rồi hạ chậm xuống',
        ],
        safetyNote: 'Tập tư thế ngồi giúp giảm tải trọng lên bàn chân trước, tránh đau nhức.',
      },
      {
        id: 'curl-to-press',
        nameVi: 'Cuốn tay trước kết hợp đẩy vai',
        nameEn: 'Dumbbell Biceps Curl to Press',
        targetMuscle: 'Tay trước & Vai',
        formCues: [
          'Đứng thẳng cầm 2 tạ xuôi thân',
          'Cuốn tạ lên vai rồi xoay cổ tay đẩy thẳng qua đầu',
          'Hạ ngược lại từng nhịp chậm rãi',
        ],
        safetyNote: 'Không dùng đà lắc lưng dưới để văng tạ lên.',
      },
      {
        id: 'chair-step-touch',
        nameVi: 'Chạm mũi chân lên bậc thấp',
        nameEn: 'Chair Step Touch',
        targetMuscle: 'Tim mạch & Đùi',
        formCues: [
          'Đứng trước bậc thấp hoặc mép ghế thấp',
          'Nhấc luân phiên từng chân chạm mũi giày lên bậc',
          'Giữ nhịp thở đều trong 30 giây',
        ],
        safetyNote: 'Không bật nhảy để bảo vệ khớp gối và cổ chân.',
      },
      {
        id: 'incline-plank',
        nameVi: 'Plank chống tay lên bàn/tường',
        nameEn: 'Elevated Plank',
        targetMuscle: 'Cơ bụng & Vai',
        formCues: [
          'Chống hai tay lên mặt bàn cao ngang hông hoặc tường',
          'Bước chân ra sau giữ thân người thành đường thẳng',
          'Hít mũi thở miệng đều đặn',
        ],
        safetyNote: 'Nâng cao điểm tựa và thở đều giúp tránh chuột rút cơ bụng trước.',
      },
      {
        id: 'bird-dog',
        nameVi: 'Quỳ gối duỗi tay chân chéo',
        nameEn: 'Bird-Dog',
        targetMuscle: 'Lưng dưới & Cột sống',
        formCues: [
          'Chống hai tay và quỳ gối trên thảm',
          'Duỗi thẳng tay phải về trước và chân trái ra sau',
          'Giữ thăng bằng 1 giây rồi đổi bên',
        ],
        safetyNote: 'Siết nhẹ bụng giữ hông cân bằng, không để võng lưng.',
      },
      // ↑ thêm bài mới ngay phía trên dòng này
    ] as Exercise[]
  ).map((e) => [e.id, e]),
)

export const schedule: Record<DayKey, DayPlan> = {
  T2: {
    key: 'T2',
    label: 'Thứ Hai',
    title: 'Buổi 1: Thân Trên & Cơ Lõi',
    type: 'strength',
    items: [
      { exerciseId: 'floor-press', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'bent-over-row', sets: 3, reps: '12', restSeconds: 60 },
      { exerciseId: 'seated-shoulder-press', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'dead-bug', sets: 3, reps: '10/bên', restSeconds: 45 },
    ],
  },
  T3: {
    key: 'T3',
    label: 'Thứ Ba',
    title: 'Ngày 2: Đi Bộ',
    type: 'walk',
    description: 'Đi bộ 20 phút',
  },
  T4: {
    key: 'T4',
    label: 'Thứ Tư',
    title: 'Buổi 2: Thân Dưới & Cơ Mông',
    type: 'strength',
    items: [
      { exerciseId: 'chair-goblet-squat', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'glute-bridge', sets: 3, reps: '12-15', restSeconds: 60 },
      { exerciseId: 'dumbbell-rdl', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'seated-calf-raise', sets: 3, reps: '15-20', restSeconds: 45 },
    ],
  },
  T5: {
    key: 'T5',
    label: 'Thứ Năm',
    title: 'Ngày 4: Nghỉ Tích Cực',
    type: 'walk',
    description: 'Đi bộ nhẹ nhàng 15-20 phút giãn cơ',
  },
  T6: {
    key: 'T6',
    label: 'Thứ Sáu',
    title: 'Buổi 3: Toàn Thân Kháng Lực',
    type: 'strength',
    items: [
      { exerciseId: 'curl-to-press', sets: 3, reps: '10', restSeconds: 60 },
      { exerciseId: 'bent-over-row', sets: 3, reps: '12', restSeconds: 60 },
      { exerciseId: 'chair-step-touch', sets: 3, reps: '30s', restSeconds: 45 },
      { exerciseId: 'incline-plank', sets: 3, reps: '25s', restSeconds: 45 },
    ],
  },
  T7: {
    key: 'T7',
    label: 'Thứ Bảy',
    title: 'Ngày 6: Nghỉ Ngơi Phục Hồi',
    type: 'rest',
    description: 'Nghỉ ngơi hoàn toàn, uống đủ 2.5-3L nước',
  },
  CN: {
    key: 'CN',
    label: 'Chủ Nhật',
    title: 'Buổi 4: Toàn Thân & Cột Sống',
    type: 'strength',
    items: [
      { exerciseId: 'chair-goblet-squat', sets: 3, reps: '10-12', restSeconds: 90 },
      { exerciseId: 'floor-press', sets: 3, reps: '10-12', restSeconds: 60 },
      { exerciseId: 'bent-over-row', sets: 3, reps: '12', restSeconds: 60 },
      { exerciseId: 'bird-dog', sets: 3, reps: '10/bên', restSeconds: 45 },
    ],
  },
}

/** JS getDay(): 0=Sun..6=Sat → DayKey */
export function todayKey(d = new Date()): DayKey {
  const map: DayKey[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return map[d.getDay()]
}
