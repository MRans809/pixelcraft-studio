SET NAMES utf8mb4;
USE pixelcraft;

INSERT INTO templates(id, title, category, cover_url, description, required_image_count, accepted_mime_types, max_file_size_bytes, sort_order)
VALUES
('travel-postcard', '旅途明信片', '生活记录', '/covers/travel-postcard.svg', '将两张旅行照片组合成具有纸张质感的纪念明信片，适合记录城市、海边与公路时刻。', 2, 'image/jpeg,image/png,image/webp', 5242880, 10),
('editorial-portrait', '杂志人物封面', '社交分享', '/covers/editorial-portrait.svg', '用一张清晰人物照片制作简洁的编辑风格封面，保留充足的人像展示空间。', 1, 'image/jpeg,image/png,image/webp', 5242880, 20),
('product-notes', '产品灵感板', '品牌视觉', '/covers/product-notes.svg', '组合产品主图和细节图，形成适合方案沟通的视觉灵感板。', 3, 'image/jpeg,image/png,image/webp', 5242880, 30),
('weekend-collage', '周末拼贴日记', '生活记录', '/covers/weekend-collage.svg', '把四个片段整理成轻松的周末拼贴，适合朋友聚会和日常分享。', 4, 'image/jpeg,image/png,image/webp', 5242880, 40),
('festival-card', '节日祝福卡', '节日创意', '/covers/festival-card.svg', '使用一张照片制作留白舒展的节日祝福卡，文案和品牌内容仅作示例。', 1, 'image/jpeg,image/png,image/webp', 5242880, 50),
('social-duo', '双人故事海报', '社交分享', '/covers/social-duo.svg', '用两张照片讲述一个并置故事，适合人物、宠物或前后对比主题。', 2, 'image/jpeg,image/png,image/webp', 5242880, 60)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    category = VALUES(category),
    cover_url = VALUES(cover_url),
    description = VALUES(description),
    required_image_count = VALUES(required_image_count),
    accepted_mime_types = VALUES(accepted_mime_types),
    max_file_size_bytes = VALUES(max_file_size_bytes),
    sort_order = VALUES(sort_order);

