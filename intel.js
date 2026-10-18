/* ============================================================
 * 情报：每周 20 分钟，只关心「哪一条会改到我的管线」
 * ============================================================ */
window.INTEL = {
  desc: '你不需要追每一条新闻。AI 一年发几万个模型，真正会改到你管线的，一年不超过 5 个。这页是帮你筛掉另外 99.9% 的。',

  weekly: [
    '扫一遍 Hugging Face Daily Papers，挑 1 篇存进「待读」',
    '看一个新模型的 README —— 只看「怎么用」，不看榜单',
    '记 1 条「我的管线可能要改的地方」',
    '更新 1 次「我在用什么模型」清单'
  ],

  sources: [
    {
      tier: '每天', label: '日',
      items: [
        { t: 'Hugging Face Daily Papers', u: 'https://huggingface.co/papers', n: '社区投票筛过的，比 arXiv 干净十倍' },
        { t: 'arXiv cs.CV 最新', u: 'https://arxiv.org/list/cs.CV/recent', n: '只看标题，一天几十条，三十秒扫完' },
        { t: '机器之心', u: 'https://www.jiqizhixin.com/', n: '中文，通勤时看' },
        { t: '量子位', u: 'https://www.qbitai.com/', n: '中文，偏产品和落地' }
      ]
    },
    {
      tier: '每周', label: '周',
      items: [
        { t: 'Hugging Face 博客', u: 'https://huggingface.co/blog', n: '新模型、新库的官方发布都在这里' },
        { t: 'Papers with Code', u: 'https://paperswithcode.com/', n: '只带代码的论文' },
        { t: 'ComfyUI Releases', u: 'https://github.com/comfyanonymous/ComfyUI/releases', n: '你的主战场，更新了没有' },
        { t: 'sd-scripts', u: 'https://github.com/kohya-ss/sd-scripts', n: 'LoRA 训练的事实标准' }
      ]
    },
    {
      tier: '每月', label: '月',
      items: [
        { t: '精读 1 篇论文', u: 'https://huggingface.co/papers', n: '从周存里挑，读完写 200 字' },
        { t: '复现 1 个 demo', u: 'https://github.com/trending/python?since=monthly', n: 'GitHub 月榜挑一个能跑的' },
        { t: '更新你的技术地图', u: '', n: '写下：哪些假设变了、哪一步可以换掉' }
      ]
    }
  ],

  filter: [
    { q: '有原始论文或代码吗？', a: '没有 → 二手转述，最多看一眼标题' },
    { q: '它改到我管线里的哪一步？', a: '说不出 → 和你没关系，存档就好' },
    { q: '三个月后它还重要吗？', a: '不重要 → 那是噪音，不是信号' }
  ],

  noise: [
    '标题带「震惊 / 碾压 / 取代 / 一夜之间」的',
    '不给原始论文、不给仓库链接的',
    '只报 benchmark 分数、不讲怎么做到的',
    '同一件事被十个号同时转发的',
    '「某公司内幕」「某模型被曝」这类八卦',
    '三天前的「重大突破」还在刷屏的'
  ]
};
