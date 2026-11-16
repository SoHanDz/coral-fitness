```markdown
Build a mobile-first personal workout & habit tracking web application using **React (Vite + TypeScript)**, **Tailwind CSS**, **Lucide React**, and **Supabase**.

### 1. Design & UX Principles ("Zero Instruction" UI)
- **Mobile-First Layout:** Constrain main viewport to `max-w-md mx-auto min-h-screen` with generous touch targets (minimum `44px` height for all buttons and set checkboxes).
- **Light & Clean Aesthetic:** Off-white page background (`#FAFAFA`), pure white elevated cards (`#FFFFFF`) with subtle borders (`#E5E7EB`), dark slate primary text (`#111827`), and emerald green (`#059669`) as the primary action/completion accent.
- **Zero Instruction UX:** The interface must be 100% self-explanatory through visual hierarchy, icons, and progressive disclosure. Do NOT include onboarding modals, tutorial tooltips, or walls of explanatory text. Opening the app immediately shows today's actionable workout card.

### 2. Core Features & User Flow
1. **Auto-Schedule & Flexible Day Switcher (Header):**
   - Automatically detects the current day of the week (Mon–Sun) and displays that day's workout plan.
   - Include a compact horizontal 7-day pill selector (`T2`, `T3`, `T4`, `T5`, `T6`, `T7`, `CN`) at the top so the user can manually switch to another day's workout (e.g., making up a missed Sunday workout on Monday).
2. **"Chế độ chống lười" (Lazy Mode Toggle):**
   - On strength training days, display a prominent toggle switch: `Chế độ chống lười (1 hiệp/bài)`.
   - When turned ON, every exercise dynamically changes from `3 hiệp` to `1 hiệp` to eliminate friction on low-energy mornings.
3. **Active Workout Session & Screen Wake Lock:**
   - Tapping **"Bắt đầu tập"** starts a live session elapsed-time counter and requests `navigator.wakeLock.request('screen')` (with graceful fallback) so the phone screen stays awake during workouts.
   - Each exercise card shows: Exercise Vietnamese name, English subtitle, `Sets x Reps`, rest duration badge, and clickable set checkboxes (`Hiệp 1`, `Hiệp 2`, `Hiệp 3`).
4. **Exercise Detail Bottom Drawer / Modal:**
   - Clicking an exercise title/thumbnail opens a clean bottom sheet containing:
     - **GIF Display Container:** Loads `/gifs/{exercise.id}.gif` at the top (aspect-video / square, rounded-xl). If the image fails to load (`onError`), render a clean styled placeholder showing the exercise English name and target muscle badge so it looks polished before local GIFs are added.
     - **Form Cues:** 2–3 short, scannable bullet points in Vietnamese.
     - **Joint Safety Callout:** Highlighted soft-amber box (`bg-amber-50 border-amber-200 text-amber-900`) displaying specific joint/form safety notes.
5. **Auto Rest Timer:**
   - Checking off any set checkbox automatically triggers a sticky bottom **Rest Timer bar** counting down from the exercise's `restSeconds` (`45s`, `60s`, or `90s`).
   - Include `+15s` and `Bỏ qua` (Skip) buttons, plus a subtle Web Audio API beep sound when the countdown hits `0`.
6. **Active Recovery & Tuesday Grocery Checklist:**
   - On **Tuesday (`T3`)**, render a 20-minute walk completion toggle alongside an interactive **Grocery Checklist** (`Đi chợ đồ healthy giá rẻ`): *Bắp cải trắng, Dưa chuột (1kg), Cà rốt, Trứng gà (1–2 vỉ), Ức gà / Thịt nạc thăn, Đậu hũ trắng*.
   - On **Thursday (`T5`)** and **Saturday (`T7`)**, render clean active recovery / rest day cards with a quick walk logger.
7. **1-Click Journal Export & Supabase Persistence:**
   - Clicking **"Hoàn thành buổi tập"** saves the log to Supabase (`workout_logs` table) and opens a summary modal with a pre-formatted Vietnamese text block matching this exact template, plus a 1-tap **"Copy Nhật Ký"** button:
     ```text
     NHẬT KÝ 📚 Thể dục — {Thứ, DD/MM/YYYY}

     ■ Hôm nay mình tập gì
     {Day Title} {isLazyMode ? '(Chế độ chống lười)' : ''}

     ■ Tập những bài nào
     {Bulleted list of completed exercises}

     ■ Thời lượng tập: {durationMinutes} phút
     ```

### 3. Supabase Schema & Setup
Create a `supabase/schema.sql` file and initialize `@supabase/supabase-js` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (gracefully fallback to `localStorage` if env vars are not yet configured):
```sql
create table if not exists workout_logs (
  id uuid default gen_random_uuid() primary key,
  workout_date date not null default current_date,
  day_key text not null,
  title text not null,
  completed_exercises jsonb not null default '[]'::jsonb,
  duration_minutes integer not null default 0,
  is_lazy_mode boolean not null default false,
  created_at timestamptz default now()
);

```

### 4. Seed Data (Store in `src/data/workoutData.ts`)

Use all 13 exercises and the 7-day schedule below (all UI text in Vietnamese):

**Exercises (`id`, `nameVi`, `nameEn`, `targetMuscle`, `formCues`, `safetyNote`):**

1. `floor-press` | **Nằm sàn đẩy ngực 2 tay** | `Dumbbell Floor Press` | Ngực & Tay sau | Cues: `["Nằm ngửa gập gối, hai tay cầm tạ", "Hạ cùi trỏ chạm nhẹ xuống sàn rồi đẩy thẳng lên", "Thở ra khi đẩy tạ lên"]` | Safety: `"Sàn nhà giúp chặn biên độ hạ tạ, bảo vệ khớp vai tối đa."`
2. `bent-over-row` | **Cúi người kéo tạ 2 tay** | `Bent-Over Dumbbell Row` | Lưng giữa & Xô | Cues: `["Đứng chân rộng bằng vai, chùng nhẹ gối", "Đẩy hông ra sau, giữ lưng thẳng song song 45 độ", "Kéo cùi trỏ ép sát thân về phía hông"]` | Safety: `"Luôn khóa thẳng lưng dưới, tuyệt đối không gù lưng."`
3. `seated-shoulder-press` | **Ngồi ghế đẩy vai 2 tay** | `Seated Dumbbell Shoulder Press` | Cơ vai | Cues: `["Ngồi thẳng lưng tựa ghế, đưa tạ ngang tai", "Đẩy thẳng hai tạ lên qua đầu", "Hạ chậm có kiểm soát về vị trí cũ"]` | Safety: `"Không khóa cứng khớp cùi trỏ ở đỉnh động tác."`
4. `dead-bug` | **Nằm ngửa duỗi tay chân chéo** | `Dead Bug` | Cơ lõi (Core) | Cues: `["Nằm ngửa, giơ thẳng tay và gập gối 90 độ", "Duỗi chậm tay phải và chân trái sát sàn rồi đổi bên", "Hít thở đều suốt quá trình tập"]` | Safety: `"Ép chặt vùng thắt lưng dính sát xuống sàn để bảo vệ cột sống."`
5. `chair-goblet-squat` | **Squat tựa ghế giữ 1 tạ** | `Chair Goblet Squat` | Đùi trước & Mông | Cues: `["Ôm 1 quả tạ sát trước ngực, đứng trước ghế chắc chắn", "Đẩy hông ra sau hạ mông chạm nhẹ mặt ghế", "Ấn mạnh gót chân siết đùi đứng dậy"]` | Safety: `"Đầu gối mở hướng theo mũi chân, dùng ghế làm điểm tựa an toàn khớp gối."`
6. `glute-bridge` | **Cầu mông nằm sàn** | `Glute Bridge` | Cơ mông & Đùi sau | Cues: `["Nằm ngửa gập gối, hai bàn chân đặt phẳng trên sàn", "Ấn gót chân đẩy hông lên cao tạo đường thẳng", "Siết chặt mông 1 giây ở đỉnh rồi hạ xuống"]` | Safety: `"Không ưỡn quá mức làm võng thắt lưng ở điểm cao nhất."`
7. `dumbbell-rdl` | **Đẩy hông tạ đơn** | `Dumbbell Romanian Deadlift` | Đùi sau & Mông | Cues: `["Đứng thẳng cầm 2 tạ trước đùi, gối hơi chùng nhẹ", "Đẩy hông ra sau, trượt tạ sát ống chân xuống qua gối", "Siết mông kéo người đứng thẳng dậy"]` | Safety: `"Giữ tạ luôn sát chân và lưng phẳng như mặt bàn."`
8. `seated-calf-raise` | **Ngồi ghế kiễng gót** | `Seated Dumbbell Calf Raise` | Bắp chân | Cues: `["Ngồi thẳng trên ghế, đặt 2 quả tạ lên gần đầu gối", "Kiễng cao gót chân hết cỡ rồi hạ chậm xuống"]` | Safety: `"Tập tư thế ngồi giúp giảm tải trọng lên bàn chân trước, tránh đau nhức."`
9. `curl-to-press` | **Cuốn tay trước kết hợp đẩy vai** | `Dumbbell Biceps Curl to Press` | Tay trước & Vai | Cues: `["Đứng thẳng cầm 2 tạ xuôi thân", "Cuốn tạ lên vai rồi xoay cổ tay đẩy thẳng qua đầu", "Hạ ngược lại từng nhịp chậm rãi"]` | Safety: `"Không dùng đà lắc lưng dưới để văng tạ lên."`
10. `chair-step-touch` | **Chạm mũi chân lên bậc thấp** | `Chair Step Touch` | Tim mạch & Đùi | Cues: `["Đứng trước bậc thấp hoặc mép ghế thấp", "Nhấc luân phiên từng chân chạm mũi giày lên bậc", "Giữ nhịp thở đều trong 30 giây"]` | Safety: `"Không bật nhảy để bảo vệ khớp gối và cổ chân."`
11. `incline-plank` | **Plank chống tay lên bàn/tường** | `Elevated Plank` | Cơ bụng & Vai | Cues: `["Chống hai tay lên mặt bàn cao ngang hông hoặc tường", "Bước chân ra sau giữ thân người thành đường thẳng", "Hít mũi thở miệng đều đặn"]` | Safety: `"Nâng cao điểm tựa và thở đều giúp tránh chuột rút cơ bụng trước."`
12. `bird-dog` | **Quỳ gối duỗi tay chân chéo** | `Bird-Dog` | Lưng dưới & Cột sống | Cues: `["Chống hai tay và quỳ gối trên thảm", "Duỗi thẳng tay phải về trước và chân trái ra sau", "Giữ thăng bằng 1 giây rồi đổi bên"]` | Safety: `"Siết nhẹ bụng giữ hông cân bằng, không để võng lưng."`

**Weekly Schedule:**

* `T2` (Mon): **Buổi 1: Thân Trên & Cơ Lõi** (`strength`) — `floor-press` (3x10-12, 60s), `bent-over-row` (3x12, 60s), `seated-shoulder-press` (3x10-12, 60s), `dead-bug` (3x10/bên, 45s).
* `T3` (Tue): **Ngày 2: Đi Bộ & Đi Chợ Healthy** (`walk_grocery`) — Đi bộ 20 phút + Checklist mua đồ tuần.
* `T4` (Wed): **Buổi 2: Thân Dưới & Cơ Mông** (`strength`) — `chair-goblet-squat` (3x10-12, 90s), `glute-bridge` (3x12-15, 60s), `dumbbell-rdl` (3x10-12, 60s), `seated-calf-raise` (3x15-20, 45s).
* `T5` (Thu): **Ngày 4: Nghỉ Tích Cực** (`walk`) — Đi bộ nhẹ nhàng 15–20 phút giãn cơ.
* `T6` (Fri): **Buổi 3: Toàn Thân Kháng Lực** (`strength`) — `curl-to-press` (3x10, 60s), `bent-over-row` (3x12, 60s), `chair-step-touch` (3x30s, 45s), `incline-plank` (3x25s, 45s).
* `T7` (Sat): **Ngày 6: Nghỉ Ngơi Phục Hồi** (`rest`) — Nghỉ ngơi hoàn toàn, uống đủ 2.5–3L nước.
* `CN` (Sun): **Buổi 4: Toàn Thân & Cột Sống** (`strength`) — `chair-goblet-squat` (3x10-12, 90s), `floor-press` (3x10-12, 60s), `bent-over-row` (3x12, 60s), `bird-dog` (3x10/bên, 45s).

Scaffold the complete project structure, install dependencies, and verify TypeScript compilation cleanly.

```

Sau khi Claude Code dựng xong project, bạn chỉ cần làm thêm 2 bước nhỏ để chạy thực tế:
1. Tạo project mới trên **Supabase**, chạy đoạn SQL trong file `supabase/schema.sql` rồi dán `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào file `.env`.
2. Tải 12 file `.gif` từ Pinterest/Giphy đặt đúng tên theo `id` (ví dụ: `floor-press.gif`, `bent-over-row.gif`...) thả vào thư mục `public/gifs/` là giao diện sẽ tự động hiển thị hình động ngay.

```