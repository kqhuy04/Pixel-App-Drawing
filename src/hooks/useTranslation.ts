import { useTheme } from '../contexts/ThemeContext';

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.draw': { vi: 'Vẽ tranh', en: 'Draw' },
  'nav.gallery': { vi: 'Thư viện', en: 'Gallery' },
  'nav.myArts': { vi: 'Tranh của tôi', en: 'My Arts' },
  'nav.collaborative': { vi: 'Vẽ chung', en: 'Collaborative' },
  'nav.aiFeatures': { vi: 'AI Studio', en: 'AI Studio' },
  'nav.competitions': { vi: 'Cuộc thi', en: 'Competitions' },
  
  // Common
  'common.login': { vi: 'Đăng nhập', en: 'Login' },
  'common.logout': { vi: 'Đăng xuất', en: 'Logout' },
  'common.save': { vi: 'Lưu', en: 'Save' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.close': { vi: 'Đóng', en: 'Close' },
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.error': { vi: 'Có lỗi xảy ra', en: 'An error occurred' },
  
  // Settings
  'settings.title': { vi: 'Cài đặt', en: 'Settings' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.theme': { vi: 'Giao diện', en: 'Theme' },
  'settings.darkMode': { vi: 'Chế độ tối', en: 'Dark Mode' },
  'settings.lightMode': { vi: 'Chế độ sáng', en: 'Light Mode' },
  'settings.notifications': { vi: 'Thông báo', en: 'Notifications' },
  'settings.drawing': { vi: 'Cài đặt vẽ', en: 'Drawing Settings' },
  'settings.autoSave': { vi: 'Tự động lưu', en: 'Auto Save' },
  'settings.gridLines': { vi: 'Hiển thị lưới', en: 'Show Grid' },
  'settings.soundEffects': { vi: 'Hiệu ứng âm thanh', en: 'Sound Effects' },
  'settings.highContrast': { vi: 'Độ tương phản cao', en: 'High Contrast' },
  'settings.pushNotifications': { vi: 'Thông báo push', en: 'Push notifications' },
  'settings.dataManagement': { vi: 'Quản lý dữ liệu', en: 'Data Management' },
  'settings.exportData': { vi: 'Xuất dữ liệu', en: 'Export data' },
  'settings.account': { vi: 'Tài khoản', en: 'Account' },
  'settings.deleteAccount': { vi: 'Xóa tài khoản', en: 'Delete account' },
  'settings.help': { vi: 'Trợ giúp', en: 'Help' },
  'settings.reportIssue': { vi: 'Báo lỗi & Góp ý', en: 'Report issues & Feedback' },
  
  // Profile
  'profile.title': { vi: 'Hồ sơ', en: 'Profile' },
  'profile.edit': { vi: 'Chỉnh sửa', en: 'Edit' },
  'profile.bio': { vi: 'Giới thiệu', en: 'Bio' },
  'profile.location': { vi: 'Vị trí', en: 'Location' },
  'profile.joinDate': { vi: 'Tham gia từ', en: 'Joined' },
  'profile.artworks': { vi: 'Tác phẩm', en: 'Artworks' },
  'profile.likes': { vi: 'Lượt thích', en: 'Likes' },
  
  // Canvas
  'canvas.title': { vi: 'Tạo tác phẩm pixel art của bạn', en: 'Create your pixel art' },
  'canvas.tip': { vi: 'Mẹo: Sử dụng chuột hoặc chạm để vẽ. Giữ và kéo để vẽ liên tục.', en: 'Tip: Use mouse or touch to draw. Hold and drag to draw continuously.' },
  
  // Tools
  'tools.pen': { vi: 'Bút vẽ', en: 'Pen' },
  'tools.eraser': { vi: 'Tẩy', en: 'Eraser' },
  'tools.fill': { vi: 'Tô màu', en: 'Fill' },
  'tools.eyedropper': { vi: 'Chọn màu', en: 'Eyedropper' },
  'tools.spray': { vi: 'Phun sương', en: 'Spray' },
  'tools.line': { vi: 'Đường thẳng', en: 'Line' },
  'tools.rectangle': { vi: 'Hình chữ nhật', en: 'Rectangle' },
  'tools.circle': { vi: 'Hình tròn', en: 'Circle' },
  'tools.undo': { vi: 'Hoàn tác', en: 'Undo' },
  'tools.redo': { vi: 'Làm lại', en: 'Redo' },
  'tools.clear': { vi: 'Xóa canvas', en: 'Clear Canvas' },
  'tools.save': { vi: 'Lưu tranh', en: 'Save Art' },
  'tools.export': { vi: 'Xuất file', en: 'Export' },
  'tools.share': { vi: 'Chia sẻ', en: 'Share' },
  'tools.move': { vi: 'Di chuyển', en: 'Move' },
  'tools.rotateLeft': { vi: 'Xoay trái', en: 'Rotate Left' },
  'tools.rotateRight': { vi: 'Xoay phải', en: 'Rotate Right' },
  'tools.flipHorizontal': { vi: 'Lật ngang', en: 'Flip Horizontal' },
  'tools.flipVertical': { vi: 'Lật dọc', en: 'Flip Vertical' },
  'tools.brushSize': { vi: 'Kích thước bút', en: 'Brush Size' },
  'tools.canvasSize': { vi: 'Kích thước canvas', en: 'Canvas Size' },
  'tools.selectSize': { vi: 'Chọn kích thước', en: 'Select Size' },
  'tools.currentSize': { vi: 'Hiện tại', en: 'Current' },
  'tools.pixels': { vi: 'pixels', en: 'pixels' },
  'tools.small': { vi: 'Nhỏ', en: 'Small' },
  'tools.medium': { vi: 'Vừa', en: 'Medium' },
  'tools.default': { vi: 'Mặc định', en: 'Default' },
  'tools.large': { vi: 'Lớn', en: 'Large' },
  'tools.veryLarge': { vi: 'Rất lớn', en: 'Very Large' },
  'tools.custom': { vi: 'Tùy chỉnh', en: 'Custom' },
  'tools.drawingTools': { vi: 'Công cụ vẽ', en: 'Drawing Tools' },
  'tools.basicTools': { vi: 'Công cụ cơ bản', en: 'Basic Tools' },
  'tools.geometry': { vi: 'Hình học', en: 'Geometry' },
  'tools.transform': { vi: 'Biến đổi', en: 'Transform' },
  'tools.freeDraw': { vi: 'Vẽ tự do', en: 'Free Draw' },
  'tools.erasePixel': { vi: 'Xóa pixel', en: 'Erase Pixel' },
  'tools.fillArea': { vi: 'Tô vùng cùng màu', en: 'Fill Same Color Area' },
  'tools.pickColor': { vi: 'Lấy màu từ canvas', en: 'Pick Color from Canvas' },
  'tools.sprayEffect': { vi: 'Tạo hiệu ứng phun sương', en: 'Create Spray Effect' },
  'tools.drawLine': { vi: 'Vẽ đường thẳng', en: 'Draw Line' },
  'tools.drawRectangle': { vi: 'Vẽ hình chữ nhật', en: 'Draw Rectangle' },
  'tools.drawCircle': { vi: 'Vẽ hình tròn', en: 'Draw Circle' },
  'tools.moveSelection': { vi: 'Di chuyển vùng chọn', en: 'Move Selection' },
  
  // Color Palette
  'colorPalette.title': { vi: 'Bảng màu', en: 'Color Palette' },
  'colorPalette.selectedColor': { vi: 'Màu đã chọn', en: 'Selected Color' },
  
  // App specific
  'app.title': { vi: 'Pixel Art Studio', en: 'Pixel Art Studio' },
  'app.welcome': { vi: 'Chào mừng đến với Pixel Art Studio!', en: 'Welcome to Pixel Art Studio!' },
  'app.welcomeDescription': { vi: 'Đăng nhập để lưu trữ tác phẩm, tham gia cuộc thi và chia sẻ với cộng đồng.', en: 'Login to save your artwork, join competitions and share with the community.' },
  'app.loginNow': { vi: 'Đăng nhập ngay', en: 'Login now' },
  'app.needLogin': { vi: 'Cần đăng nhập', en: 'Login required' },
  'app.confirmClear': { vi: 'Bạn có chắc chắn muốn xóa toàn bộ canvas?', en: 'Are you sure you want to clear the entire canvas?' },
  'app.artworkCopied': { vi: 'Tác phẩm đã được sao chép vào clipboard!', en: 'Artwork copied to clipboard!' },
  'app.copyError': { vi: 'Không thể sao chép tác phẩm. Vui lòng thử lại.', en: 'Unable to copy artwork. Please try again.' },
  'app.artworkSaved': { vi: 'Tác phẩm đã được lưu thành công với ID:', en: 'Artwork saved successfully with ID:' },
  'app.newTools': { vi: 'Công cụ mới: Đường thẳng, hình chữ nhật, hình tròn, chọn màu, phun sương', en: 'New tools: Line, rectangle, circle, color picker, spray' },
  
  // Gallery
  'gallery.title': { vi: 'Thư viện tranh', en: 'Art Gallery' },
  'gallery.searchPlaceholder': { vi: 'Tìm kiếm tác phẩm', en: 'Search artworks' },
  'gallery.filter': { vi: 'Bộ lọc', en: 'Filter' },
  'gallery.createNew': { vi: 'Tạo tranh mới', en: 'Create new art' },
  'gallery.all': { vi: 'Tất cả', en: 'All' },
  'gallery.trending': { vi: 'Xu hướng', en: 'Trending' },
  'gallery.easy': { vi: 'Dễ', en: 'Easy' },
  'gallery.medium': { vi: 'Trung bình', en: 'Medium' },
  'gallery.hard': { vi: 'Khó', en: 'Hard' },
  'gallery.leaderboard': { vi: 'Bảng xếp hạng', en: 'Leaderboard' },
  'gallery.by': { vi: 'bởi', en: 'by' },
  'gallery.likes': { vi: 'Lượt thích', en: 'Likes' },
  'gallery.views': { vi: 'Lượt xem', en: 'Views' },
  'gallery.comments': { vi: 'Bình luận', en: 'Comments' },
  'gallery.tags': {
    'animal': { vi: 'động vật', en: 'animal' },
    'cute': { vi: 'dễ thương', en: 'cute' },
    'landscape': { vi: 'phong cảnh', en: 'landscape' },
    'sunset': { vi: 'hoàng hôn', en: 'sunset' },
    'game': { vi: 'game', en: 'game' },
    'fantasy': { vi: 'fantasy', en: 'fantasy' },
    'robot': { vi: 'robot', en: 'robot' },
    'sci-fi': { vi: 'sci-fi', en: 'sci-fi' },
    'flower': { vi: 'hoa', en: 'flower' },
    'spring': { vi: 'mùa xuân', en: 'spring' },
    'space': { vi: 'không gian', en: 'space' },
    'spaceship': { vi: 'tàu vũ trụ', en: 'spaceship' }
  },
  
  // My Arts
  'myArts.title': { vi: 'Tác phẩm của tôi', en: 'My Works' },
  'myArts.subtitle': { vi: 'Quản lý và theo dõi tất cả tác phẩm của bạn', en: 'Manage and track all your works' },
  'myArts.createNew': { vi: 'Tạo tranh mới', en: 'Create new art' },
  'myArts.total': { vi: 'Tổng cộng', en: 'Total' },
  'myArts.published': { vi: 'Đã xuất bản', en: 'Published' },
  'myArts.draft': { vi: 'Bản nháp', en: 'Draft' },
  'myArts.competition': { vi: 'Thi đấu', en: 'Competition' },
  'myArts.totalLikes': { vi: 'Tổng like', en: 'Total likes' },
  'myArts.totalViews': { vi: 'Tổng view', en: 'Total views' },
  'myArts.searchPlaceholder': { vi: 'Tìm kiếm theo tên hoặc tag...', en: 'Search by name or tag...' },
  'myArts.all': { vi: 'Tất cả', en: 'All' },
  'myArts.created': { vi: 'Tạo', en: 'Created' },
  'myArts.updated': { vi: 'Cập nhật', en: 'Updated' },
  'myArts.edit': { vi: 'Sửa', en: 'Edit' },
  
  // Collaborative
  'collaborative.title': { vi: 'Phòng vẽ chung', en: 'Collaborative Drawing Room' },
  'collaborative.subtitle': { vi: 'Tham gia hoặc tạo phòng để vẽ cùng bạn bè', en: 'Join or create a room to draw with friends' },
  'collaborative.createRoom': { vi: 'Tạo phòng mới', en: 'Create new room' },
  'collaborative.refresh': { vi: 'Làm mới', en: 'Refresh' },
  'collaborative.join': { vi: 'Tham gia', en: 'Join' },
  'collaborative.creator': { vi: 'Người tạo', en: 'Creator' },
  'collaborative.hoursAgo': { vi: 'giờ trước', en: 'hours ago' },
  'collaborative.roomName': { vi: 'Tên phòng', en: 'Room name' },
  'collaborative.roomDescription': { vi: 'Mô tả phòng', en: 'Room description' },
  'collaborative.create': { vi: 'Tạo', en: 'Create' },
  'collaborative.cancel': { vi: 'Hủy', en: 'Cancel' },
  'collaborative.leave': { vi: 'Rời phòng', en: 'Leave room' },
  'collaborative.save': { vi: 'Lưu', en: 'Save' },
  'collaborative.chatPlaceholder': { vi: 'Nhập tin nhắn...', en: 'Type a message...' },
  'collaborative.send': { vi: 'Gửi', en: 'Send' },
  
  // AI Features
  'ai.title': { vi: 'AI Creative Studio', en: 'AI Creative Studio' },
  'ai.subtitle': { vi: 'Sử dụng sức mạnh AI để nâng cao và biến đổi tác phẩm nghệ thuật của bạn', en: 'Use the power of AI to enhance and transform your artwork' },
  'ai.complete': { vi: 'Hoàn thiện', en: 'Complete' },
  'ai.style': { vi: 'Phong cách', en: 'Style' },
  'ai.animation': { vi: 'Hoạt ảnh', en: 'Animation' },
  'ai.gameStyle': { vi: 'Game Style', en: 'Game Style' },
  'ai.completeSketch': { vi: 'AI Hoàn thiện phác thảo', en: 'AI Complete Sketch' },
  'ai.completeDescription': { vi: 'Vẽ những nét cơ bản, AI sẽ tự động hoàn thiện thành tranh chi tiết và đẹp mắt', en: 'Draw basic strokes, AI will automatically complete it into a detailed and beautiful painting' },
  'ai.currentArtwork': { vi: 'Tác phẩm hiện tại', en: 'Current artwork' },
  'ai.result': { vi: 'Kết quả AI', en: 'AI Result' },
  'ai.resultPlaceholder': { vi: 'Kết quả sẽ hiển thị ở đây', en: 'Result will be displayed here' },
  'ai.completeWithAI': { vi: 'Hoàn thiện với AI', en: 'Complete with AI' },
  
  // Competitions
  'competitions.title': { vi: 'Cuộc thi đang diễn ra', en: 'Ongoing Competitions' },
  'competitions.prize': { vi: 'Giải thưởng', en: 'Prize' },
  'competitions.theme': { vi: 'Chủ đề', en: 'Theme' },
  'competitions.difficulty': { vi: 'Độ khó', en: 'Difficulty' },
  'competitions.timeRemaining': { vi: 'Thời gian còn lại', en: 'Time remaining' },
  'competitions.remaining': { vi: 'Còn lại', en: 'Remaining' },
  'competitions.days': { vi: 'ngày', en: 'days' },
  'competitions.hours': { vi: 'giờ', en: 'hours' },
  'competitions.participants': { vi: 'người tham gia', en: 'participants' },
  'competitions.joinNow': { vi: 'Tham gia ngay', en: 'Join Now' },
  'competitions.details': { vi: 'Chi tiết', en: 'Details' },
  'competitions.springContest': { vi: 'Cuộc thi Pixel Art mùa Xuân', en: 'Spring Pixel Art Contest' },
  'competitions.characterDesign': { vi: 'Character Design Challenge', en: 'Character Design Challenge' },
  'competitions.beginnerContest': { vi: 'Beginner Pixel Contest', en: 'Beginner Pixel Contest' },
  'competitions.cherryBlossom': { vi: 'Hoa anh đào và thiên nhiên', en: 'Cherry blossoms and nature' },
  'competitions.retroCharacter': { vi: 'Nhân vật game retro', en: 'Retro game characters' },
  'competitions.cuteAnimals': { vi: 'Động vật dễ thương', en: 'Cute animals' },
  
  // Search Panel
  'search.placeholder': { vi: 'Tìm kiếm tác phẩm, tag, nghệ sĩ...', en: 'Search artworks, tags, artists...' },
  'search.filter': { vi: 'Bộ lọc', en: 'Filter' },
  'search.popularTags': { vi: 'Tag phổ biến', en: 'Popular Tags' },
  'search.difficulty': { vi: 'Độ khó', en: 'Difficulty' },
  'search.allDifficulties': { vi: 'Tất cả độ khó', en: 'All difficulties' },
  'search.time': { vi: 'Thời gian', en: 'Time' },
  'search.allTime': { vi: 'Mọi thời gian', en: 'All time' },
  'search.today': { vi: 'Hôm nay', en: 'Today' },
  'search.week': { vi: '7 ngày qua', en: 'Past 7 days' },
  'search.month': { vi: '30 ngày qua', en: 'Past 30 days' },
  'search.year': { vi: 'Năm nay', en: 'This year' },
  'search.sortBy': { vi: 'Sắp xếp theo', en: 'Sort by' },
  'search.newest': { vi: 'Mới nhất', en: 'Newest' },
  'search.oldest': { vi: 'Cũ nhất', en: 'Oldest' },
  'search.mostLiked': { vi: 'Nhiều like nhất', en: 'Most liked' },
  'search.mostViewed': { vi: 'Nhiều view nhất', en: 'Most viewed' },
  'search.trending': { vi: 'Xu hướng', en: 'Trending' },
  'search.random': { vi: 'Ngẫu nhiên', en: 'Random' },
  'search.likesCount': { vi: 'Số lượng like', en: 'Number of likes' },
  'search.viewsCount': { vi: 'Số lượng view', en: 'Number of views' },
  'search.artist': { vi: 'Nghệ sĩ', en: 'Artist' },
  'search.artistPlaceholder': { vi: 'Tên nghệ sĩ...', en: 'Artist name...' },
  'search.quickFilters': { vi: 'Bộ lọc nhanh', en: 'Quick filters' },
  'search.trendingWeek': { vi: 'Xu hướng tuần', en: 'Trending this week' },
  'search.mostLoved': { vi: 'Được yêu thích', en: 'Most loved' },
  'search.forBeginners': { vi: 'Cho người mới', en: 'For beginners' },
  'search.challenge': { vi: 'Thử thách', en: 'Challenge' },
  
  // AI Features - Animation
  'ai.idle': { vi: 'Đứng yên', en: 'Idle' },
  'ai.walk': { vi: 'Đi bộ', en: 'Walk' },
  'ai.run': { vi: 'Chạy', en: 'Run' },
  'ai.jump': { vi: 'Nhảy', en: 'Jump' },
  'ai.attack': { vi: 'Tấn công', en: 'Attack' },
  'ai.wave': { vi: 'Vẫy tay', en: 'Wave' }
};

export const useTranslation = () => {
  const { language } = useTheme();

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.vi;
  };

  return { t, language };
};
