create table slackjar_trick_three.typing_article
(
    id          bigint auto_increment comment '文章ID'
        primary key,
    title       varchar(100)      not null comment '文章标题',
    content     text              not null comment '文章内容',
    word_count  int               not null comment '字数',
    difficulty  tinyint default 1 not null comment '难度等级（1-简单，2-中等，3-困难）',
    category    varchar(50)       null comment '文章分类',
    status      tinyint default 0 not null comment '状态（0-启用，1-禁用）',
    create_time bigint            null comment '创建时间（毫秒时间戳）',
    update_time bigint            null comment '更新时间（毫秒时间戳）',
    deleted     tinyint default 0 not null comment '逻辑删除（0-未删，1-已删）',
    version     bigint  default 1 not null comment '版本号（用于乐观锁）'
)
    comment '打字测试文章表';

create table slackjar_trick_three.typing_test_record
(
    id                bigint auto_increment comment '记录ID'
        primary key,
    user_id           bigint            not null comment '用户ID',
    article_id        bigint            not null comment '文章ID',
    article_title     varchar(100)      not null comment '文章标题（冗余存储）',
    wpm               decimal(10, 2)    not null comment '每分钟字数',
    accuracy          decimal(10, 2)    not null comment '打字准确率（百分比）',
    typed_text        text              not null comment '用户输入的文本',
    correct_chars     int               not null comment '正确字符数',
    total_chars       int               not null comment '总输入字符数',
    test_duration     int               not null comment '测试时长（秒）',
    start_time        bigint            not null comment '开始时间（毫秒时间戳）',
    end_time          bigint            not null comment '结束时间（毫秒时间戳）',
    create_time       bigint            null comment '创建时间（毫秒时间戳）',
    update_time       bigint            null comment '更新时间（毫秒时间戳）',
    deleted           tinyint default 0 not null comment '逻辑删除（0-未删，1-已删）',
    version           bigint  default 1 not null comment '版本号（用于乐观锁）',
    index idx_user_id (user_id),
    index idx_start_time (start_time)
)
    comment '打字测试记录表';

insert into slackjar_trick_three.typing_article (title, content, word_count, difficulty, category, status, create_time) values
('春天的故事', '春天来了，万物复苏。小草从土里探出头来，树木抽出嫩绿的新芽，花儿们也争相开放。鸟儿在枝头欢快地歌唱，蝴蝶在花丛中翩翩起舞。微风轻轻吹拂，带来了阵阵花香。这是一个充满生机和希望的季节，让人心旷神怡。', 128, 1, '散文', 0, 1717123200000),
('科技改变生活', '随着科技的飞速发展，我们的生活发生了翻天覆地的变化。智能手机、互联网、人工智能等新技术正在深刻地改变着我们的生活方式。从购物到出行，从工作到娱乐，科技的影响无处不在。未来，科技将继续推动社会进步，让我们的生活更加便捷、美好。', 132, 2, '科技', 0, 1717123200001),
('读书的意义', '读书是一种享受，也是一种修行。在书的世界里，我们可以穿越时空，与古今中外的智者对话。读书可以开阔视野，增长知识，陶冶情操。一本好书就像一位良师益友，陪伴我们成长，指引我们前行。让我们爱上阅读，在书的海洋中遨游。', 118, 1, '文学', 0, 1717123200002),
('运动的快乐', '生命在于运动。无论是跑步、游泳、打球还是瑜伽，运动都能让我们的身体更健康，心情更愉悦。运动不仅能增强体质，还能培养毅力和团队精神。当我们挥洒汗水的时候，所有的烦恼都会烟消云散。让我们动起来，享受运动带来的快乐！', 112, 1, '健康', 0, 1717123200003),
('编程的乐趣', '编程是一种创造性的活动。通过代码，我们可以实现各种有趣的想法和功能。从简单的Hello World到复杂的应用程序，每一次成功的运行都会带来满满的成就感。编程不仅是一种技能，更是一种思维方式，它教会我们如何逻辑地思考问题。', 125, 2, '技术', 0, 1717123200004),
('旅行的意义', '旅行是一种探索，也是一种发现。每一次旅行都能让我们看到不同的风景，体验不同的文化。在旅途中，我们可以放松身心，开阔眼界，结识新朋友。旅行教会我们珍惜当下，感受生活的美好。让我们背上行囊，去探索这个美丽的世界吧！', 120, 2, '生活', 0, 1717123200005),
('时间的价值', '时间是最宝贵的财富。每个人每天都拥有24小时，如何利用好这些时间决定了我们的人生轨迹。时间一去不复返，我们应该珍惜每一分每一秒。合理规划时间，高效利用时间，才能实现自己的梦想。让我们做时间的主人，而不是时间的奴隶。', 115, 2, '哲理', 0, 1717123200006),
('友谊的珍贵', '友谊是人生中最宝贵的财富之一。真正的朋友会在你困难时伸出援手，在你成功时真心为你高兴。友谊需要真诚和信任来维系，需要理解和包容来滋养。一个好朋友就像一盏明灯，照亮我们前行的道路。让我们珍惜身边的每一份友谊。', 122, 1, '情感', 0, 1717123200007),
('大自然的美丽', '大自然是一幅绚丽多彩的画卷。山川河流、花草树木、飞禽走兽，构成了一个生机勃勃的世界。春天的嫩绿、夏天的绚烂、秋天的金黄、冬天的洁白，每个季节都有独特的魅力。让我们走进大自然，感受它的美丽与神奇。', 110, 1, '自然', 0, 1717123200008),
('学习的方法', '学习是一个持续的过程。掌握正确的学习方法可以事半功倍。首先要明确学习目标，制定合理的计划。其次要注重理解，而不是死记硬背。还要善于总结归纳，将知识系统化。最重要的是保持好奇心和求知欲，不断探索和发现。', 126, 2, '教育', 0, 1717123200009),
('人工智能时代', '人工智能正在改变世界。从自动驾驶到智能助手，从机器学习到深度学习，AI技术正在各个领域发挥重要作用。人工智能不仅提高了生产效率，还创造了许多新的可能性。面对AI时代的到来，我们应该积极学习，适应变化，拥抱未来。', 135, 3, '科技', 0, 1717123200010),
('梦想的力量', '梦想是人生的航标。有梦想的人永远不会迷失方向。无论遇到多大的困难，只要心中有梦想，就会有前进的动力。梦想让我们充满希望，让我们不断挑战自我，超越极限。让我们勇敢地追逐梦想，创造属于自己的精彩人生。', 118, 2, '励志', 0, 1717123200011);