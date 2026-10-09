globalThis.StudySeed = {
  lessons: [
    {
      id: 'lesson-percent', subject: '数学示例', title: '百分比', minutes: 8,
      objective: '理解百分数的含义，并能计算折扣后的价格。',
      prerequisite: '知道乘法可以表示“一个数的几倍”，知道 1/2 表示一半。',
      definition: '百分比表示把整体看作 100 份，其中某一部分占多少份。80% 就是 80/100，也就是 0.8。计算一个数的 80%，就是用这个数乘 0.8。',
      analogy: '把一张完整的百格纸当作原价。涂满 80 格代表保留原价的 80%，空出的 20 格代表减少的部分。',
      keypoints: ['先确定“整体”是谁：算折扣时，整体是原价。', '百分数转成小数：80% = 0.8，15% = 0.15。', '某部分的数量 = 整体 × 对应的百分比。', '打八折是支付原价的 80%，节省原价的 20%。'],
      pitfall: '“打八折”表示付 80%，不是减去 80%。八折后要付的钱与省下的钱是两个不同的量。',
      example: '一件外套原价 300 元，打七折。现在要付多少钱？省下多少钱？',
      steps: ['确定整体：原价 300 元。', '七折表示付 70%，即 0.7。', '应付金额：300 × 0.7 = 210 元。', '省下金额：300 − 210 = 90 元。也可计算 300 × 30%。'],
      recall: '不用看讲解，解释“打八折”是什么意思。计算价格时，应当用原价乘哪个数？',
      recallAnswer: '打八折表示支付原价的 80%，用原价乘 0.8；省下的是原价的 20%。'
    },
    {
      id: 'lesson-probability', subject: '数学示例', title: '概率', minutes: 8,
      objective: '在有限、等可能的情境下计算简单概率，并识别适用条件。',
      prerequisite: '能把“部分占整体”写成分数，例如 2/5。',
      definition: '概率描述一个事件发生的可能性大小，取值从 0 到 1。对于有限且等可能的所有结果，某事件的概率 = 符合该事件的结果数 ÷ 所有结果数。',
      analogy: '袋里有 5 个大小、材质相同的球，其中 2 个是红球。充分混合后随机摸一个，每个球被摸到的机会相同，红球概率就是 2/5。',
      keypoints: ['先列出所有可能结果，避免遗漏。', '确认每种结果等可能，才能直接按结果数计算。', '再数出符合要求的结果。', '概率不是对某一次结果的保证：概率 1/2 不代表掷两次必有一次正面。'],
      pitfall: '不能仅凭“有两个结果”就判定各占 1/2。例如“中奖与不中奖”是两种情况，但它们未必等可能。',
      example: '掷一颗均匀的六面骰子，出现大于 4 的点数的概率是多少？',
      steps: ['所有可能点数是 1、2、3、4、5、6，共 6 种。', '骰子均匀，每种点数等可能。', '大于 4 的点数是 5、6，共 2 种。', '概率 = 2/6 = 1/3。'],
      recall: '为什么计算“符合结果数 ÷ 所有结果数”前，需要先确认等可能？',
      recallAnswer: '如果各结果的机会不同，单纯数结果不能反映真正的可能性；直接按数量相除只适用于有限且等可能的结果。'
    },
    {
      id: 'lesson-review', subject: '英语示例', title: '词汇', minutes: 6,
      objective: '在学习语境中理解并使用 review，同时根据上下文判断词义。',
      prerequisite: '知道英语里一个词可以有多个含义，动词常与宾语搭配。',
      definition: 'review 作动词时可以表示复习、回顾或审查。在学习语境里，review notes 通常表示复习笔记；review a lesson 表示复习一课的内容。具体含义要结合宾语和上下文。',
      analogy: '把 review 理解成“再看一遍并检查理解”。学习时是复习，检查一份报告时则可能是审阅。',
      keypoints: ['学习搭配：review notes / review a lesson / review for an exam。', '遇到新句子，先找宾语，再判断语境。', '名词 a book review 通常指书评，不能机械翻译成“复习”。'],
      pitfall: '不要在所有语境里把 review 都译成“复习”。“a film review”通常是一篇影评。',
      example: 'I review my notes before the test. 这句话该怎样理解？',
      steps: ['找场景：before the test 表明这是考试前的学习活动。', '找搭配：review my notes，宾语是“我的笔记”。', '结合场景翻译：我在考试前复习笔记。'],
      recall: 'review notes 与 a book review 分别是什么意思？你是如何判断的？',
      recallAnswer: 'review notes 是复习笔记，review 是动词，宾语是学习资料；a book review 是一篇书评，review 在这里是名词。'
    },
    {
      id: 'lesson-metaphor', subject: '语文示例', title: '修辞', minutes: 7,
      objective: '辨认常见比喻，并说明本体、喻体和两者的相似点。',
      prerequisite: '能从句子中找出描写对象，并理解“相似”与“相同”的区别。',
      definition: '比喻是利用不同事物之间的相似点，用一种事物来描写另一种事物。被描写的事物叫本体，用来作比的事物叫喻体。“像、仿佛、好似”等词可以提示比喻，但不能仅凭这些词判定。',
      analogy: '说“月亮像一只玉盘”，是借玉盘的圆和明亮，让月亮的形象更具体。月亮与玉盘是不同事物，但有可感知的相似点。',
      keypoints: ['找本体：句子实际在描写什么？', '找喻体：用什么事物来描写它？', '找相似点：形状、颜色、动作或感受有什么相似？', '辨认时结合全句，不能只找一个“像”字。'],
      pitfall: '“他长得像他的爸爸”是在比较同类人物的外貌，通常不是比喻。“他好像没来”是在推测，也不是比喻。',
      example: '“平静的湖面像一面镜子。”为什么这是比喻？',
      steps: ['本体是平静的湖面。', '喻体是一面镜子。', '相似点是平整、明亮，能够映出景物。', '湖面与镜子属于不同事物，句子借镜子的形象表现湖面，因此是比喻。'],
      recall: '判断一句话是不是比喻，除了看到“像”，还要检查什么？',
      recallAnswer: '要检查是否用一种事物描写另一种不同的事物，并找出它们的相似点；比较同类事物或表示推测的“像”不一定构成比喻。'
    }
  ],
  questions: [
    {id:'demo-1',lessonId:'lesson-percent',subject:'数学示例',topic:'百分比',prompt:'一件商品原价 200 元，打八折后的价格是多少？',options:['40 元','160 元','180 元'],correctIndex:1,answer:'160 元',explanation:'八折表示支付原价的 80%：200 × 0.8 = 160。40 元是省下的金额。'},
    {id:'percent-2',lessonId:'lesson-percent',subject:'数学示例',topic:'百分比',prompt:'一本书原价 80 元，打九折。省下多少钱？',options:['72 元','9 元','8 元'],correctIndex:2,answer:'8 元',explanation:'支付 90%，省下 10%。80 × 0.1 = 8 元；72 元是应付金额。'},
    {id:'percent-3',lessonId:'lesson-percent',subject:'数学示例',topic:'百分比',prompt:'某班有 40 人，其中 25% 参加合唱团。合唱团有几人？',options:['10 人','25 人','15 人'],correctIndex:0,answer:'10 人',explanation:'整体是全班 40 人。25% = 0.25，40 × 0.25 = 10 人。'},
    {id:'demo-4',lessonId:'lesson-probability',subject:'数学示例',topic:'概率',prompt:'掷一枚均匀的硬币一次，出现正面的概率是多少？',options:['0','1/2','1'],correctIndex:1,answer:'1/2',explanation:'正面和反面是两个等可能的结果，其中一个符合要求。'},
    {id:'probability-2',lessonId:'lesson-probability',subject:'数学示例',topic:'概率',prompt:'掷一颗均匀的六面骰子，出现偶数的概率是多少？',options:['1/6','2/3','1/2'],correctIndex:2,answer:'1/2',explanation:'偶数有 2、4、6 共 3 种，所有等可能结果共 6 种。3/6 = 1/2。'},
    {id:'probability-3',lessonId:'lesson-probability',subject:'数学示例',topic:'概率',prompt:'某抽奖只有“中奖”和“未中奖”两种情况，可以直接断定中奖概率是 1/2 吗？',options:['不可以，需知道是否等可能','可以，因为有两种情况','可以，任何概率都是 1/2'],correctIndex:0,answer:'不可以，需知道是否等可能',explanation:'只有两种情况，不代表它们的机会相同。例如 100 张票只有 1 张中奖，中奖概率就不是 1/2。'},
    {id:'demo-2',lessonId:'lesson-review',subject:'英语示例',topic:'词汇',prompt:'“review”作为动词，在学习笔记的语境里通常表示什么？',options:['复习；回顾','遗忘','打断'],correctIndex:0,answer:'复习；回顾',explanation:'review notes 表示复习笔记。词义要结合学习语境判断。'},
    {id:'review-2',lessonId:'lesson-review',subject:'英语示例',topic:'词汇',prompt:'I review my notes before the test. 句中的 review 最适合译成什么？',options:['出版','复习','借走'],correctIndex:1,answer:'复习',explanation:'宾语是 notes，且动作发生在考试前，因此这里是复习笔记。'},
    {id:'review-3',lessonId:'lesson-review',subject:'英语示例',topic:'词汇',prompt:'a book review 通常是什么意思？',options:['一次复习','一本练习册','一篇书评'],correctIndex:2,answer:'一篇书评',explanation:'这里 review 是名词，表示评论；不能把所有 review 都译成复习。'},
    {id:'demo-3',lessonId:'lesson-metaphor',subject:'语文示例',topic:'修辞',prompt:'“春风像一把温柔的梳子”使用了哪种修辞手法？',options:['反问','比喻','夸张'],correctIndex:1,answer:'比喻',explanation:'本体是春风，喻体是梳子，借梳子的动作表现春风轻柔地拂过。'},
    {id:'metaphor-2',lessonId:'lesson-metaphor',subject:'语文示例',topic:'修辞',prompt:'“平静的湖面像一面镜子”中，喻体是什么？',options:['湖面','平静','镜子'],correctIndex:2,answer:'镜子',explanation:'实际描写对象（本体）是湖面，用来作比的事物（喻体）是镜子。'},
    {id:'metaphor-3',lessonId:'lesson-metaphor',subject:'语文示例',topic:'修辞',prompt:'下列哪一句通常不属于比喻？',options:['他长得像他的爸爸','星星像一颗颗宝石','树叶像一只只小船'],correctIndex:0,answer:'他长得像他的爸爸',explanation:'这是同类人物之间的外貌比较。另两句借不同事物的相似点描写对象。'}
  ]
};
// Match the checklist to each recall prompt, rather than all lesson content.
const recallCriteriaById={
 'lesson-percent':['八折表示支付原价的 80%。','计算应付金额用原价乘 0.8。'],
 'lesson-probability':['各结果机会不同时，单纯数结果不能反映概率。','按结果数相除，需要有限且等可能的条件。'],
 'lesson-review':['review notes 表示复习笔记，review 作动词。','a book review 表示一篇书评，review 作名词。'],
 'lesson-metaphor':['识别本体和喻体，判断是否是不同事物。','找出两者相似点，排除同类比较和推测。']
};
StudySeed.lessons.forEach(l=>l.recallCriteria=recallCriteriaById[l.id]);
