/* ============================================================
 * 学习内容 + 课程链接 + 速通最短闭环
 * 独立文件，方便单独维护；加载后合并进 GAME_DATA
 * hours = 该关的等效投入小时数（用于剩余工期估算）
 * ============================================================ */
window.GAME_EXTRA = {
  /* ---------------- 计算机世界线 ---------------- */
  cs0: {
    hours: 12,
    fast: '命令行 12 个命令 + 一次 Git 冲突 + 建好第一个仓库。调试器可以后补。',
    content: [
      '终端：cd / ls / mkdir / cp / mv / rm / cat / grep / find，管道与重定向',
      'Git 的四个对象：blob / tree / commit / ref，冲突到底在冲突什么',
      '断点、单步、看变量、看调用栈——四个动作解决 80% 的 bug',
      '从报错里读出：哪个文件、哪一行、什么类型',
      '用命令行完成一次批量改名（练手题）'
    ],
    resources: [
      { t: 'MIT《计算机教育中缺失的一课》中文站（备用）', u: 'https://missing-semester-cn.github.io/', k: '备用', n: '国内可能打不开、视频在 YouTube 上；优先看 B 站版' },
      { t: 'Learn Git Branching', u: 'https://learngitbranching.js.org/?locale=zh_CN', k: '练', n: '可视化练分支合并，一晚上打通' },
      { t: 'Pro Git（中文版）', u: 'https://git-scm.com/book/zh/v2', k: '书', n: '当手册查，别通读' }
    ]
  },
  cs1: {
    hours: 50,
    fast: '3 个能跑的小脚本 + 一次全过的测试。别碰框架。',
    content: [
      '变量、条件、循环、函数、列表、字典、字符串、文件读写、异常',
      '模块与包：pip、venv、requirements.txt，以及「在我电脑上能跑」的成因',
      '用 argparse 写带参数的命令行工具',
      '用 requests 抓数据、用 json 存结果',
      '写 5 个测试并跑通（pytest 足够）'
    ],
    resources: [
      { t: 'Python 官方教程（中文）', u: 'https://docs.python.org/zh-cn/3/tutorial/', k: '文档', n: '最准，卡住先查它' },
      { t: 'Automate the Boring Stuff', u: 'https://automatetheboringstuff.com/', k: '书', n: '免费在线，全是「能干活」的小工具' },
      { t: 'Exercism Python', u: 'https://exercism.org/tracks/python', k: '练', n: '有导师点评的练习' }
    ]
  },
  cs2: {
    hours: 110,
    fast: '手写 4 种结构 + 60 道 Medium。剩下两种边刷边补。',
    content: [
      '8 种结构的手写实现，以及各自的增删改查复杂度',
      '二分、排序、递归、BFS / DFS、回溯、贪心、基础 DP',
      '用数据范围反推复杂度：n = 10⁵ 基本就是 O(n log n)',
      '错题本：每道题一句话记「考的是哪个套路」',
      '限时训练：Medium 30 分钟内出思路'
    ],
    resources: [
      { t: '《Hello 算法》', u: 'https://www.hello-algo.com/', k: '书', n: '免费、图解、有可跑代码，中文首选' },
      { t: 'LeetCode 中文站', u: 'https://leetcode.cn/', k: '练', n: '按标签刷，别按顺序刷' },
      { t: 'CS61B（伯克利数据结构）', u: 'https://sp21.datastructur.es/', k: '课', n: '作业质量极高，Java' }
    ]
  },
  cs3: {
    hours: 230,
    fast: 'Data Lab + Bomb Lab 两个必做，配 CSAPP 前四章。Malloc 可以留到以后。',
    content: [
      '整数补码、IEEE754 浮点、位运算',
      '栈帧、调用约定、用 gdb 读汇编',
      '进程 vs 线程，fork 之后父子进程共享什么',
      '虚拟内存、页表、TLB、缓存命中与 cache line',
      '系统调用、文件描述符、IO 模型',
      '为什么按行遍历比按列快：连续地址才命中缓存'
    ],
    resources: [
      { t: 'CSAPP 官方 Lab', u: 'http://csapp.cs.cmu.edu/3e/labs.html', k: '练', n: 'Data / Bomb 必做，Malloc 含金量最高' },
      { t: 'CMU 15-213 课程主页', u: 'https://www.cs.cmu.edu/~213/', k: '课', n: '配 CSAPP，讲义全在' },
      { t: 'OSTEP《操作系统导论》', u: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', k: '书', n: '免费 PDF，进程和内存讲得最好' }
    ]
  },
  cs4: {
    hours: 190,
    fast: '选后端，做一个自己真会用的东西并部署上线。功能只做三个。',
    content: [
      '选一个方向 + 一个自己真的会用到的需求（这一步最省时间）',
      '登录鉴权、CRUD、分页、搜索、文件上传',
      '数据库设计、索引、JOIN、事务',
      'Docker 部署 + 域名 + HTTPS',
      '压测：知道自己的服务能扛多少并发'
    ],
    resources: [
      { t: 'Full Stack Open（中文）', u: 'https://fullstackopen.com/zh/', k: '课', n: '从开发到部署全套，作业就是项目' },
      { t: 'FastAPI 中文教程', u: 'https://fastapi.tiangolo.com/zh/tutorial/', k: '文档', n: 'Python 后端出活最快' },
      { t: 'Docker 入门', u: 'https://docs.docker.com/get-started/', k: '文档', n: '部署必过的一关' }
    ]
  },
  cs5: {
    hours: 75,
    fast: '读一个大项目 + 讲一次 30 分钟。剩下的边工作边补。',
    content: [
      '读陌生项目：入口 → 路由 → 数据层 → 日志',
      '线上排查顺序：日志 → 定位 → 复现 → 修复',
      'code review 的三类问题：正确性 / 可读性 / 边界',
      'CI：测试 + 构建 + 部署流水线',
      '把项目讲成 30 分钟的故事（为什么做、踩了什么坑）'
    ],
    resources: [
      { t: 'Google 工程实践（Code Review）', u: 'https://google.github.io/eng-practices/', k: '文档', n: 'review 的行业标准' },
      { t: 'Software Engineering at Google', u: 'https://abseil.io/resources/swe-book', k: '书', n: '免费在线，讲真实团队怎么干活' },
      { t: 'GitHub Skills', u: 'https://skills.github.com/', k: '练', n: '边做边学 CI / Actions' }
    ]
  },

  /* ---------------- 数媒世界线 ---------------- */
  dm0: {
    hours: 18,
    fast: '租一张卡 + 跑通一次推理 + 下载回本地。就这三步。',
    content: [
      'nvidia-smi 每一列什么意思，显存和 OOM',
      'CUDA 版本 ↔ torch 版本的对应关系（装错版本是最大时间黑洞）',
      '云端传文件、开 JupyterLab、用 tmux / nohup 保活',
      '一次完整推理：拉模型 → 跑 → 把结果下载回本地',
      'OOM 的 5 种解法与各自的副作用'
    ],
    resources: [
      { t: 'PyTorch 60 分钟入门', u: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html', k: '课', n: '两小时跑通张量与自动求导' },
      { t: 'AutoDL 帮助文档', u: 'https://www.autodl.com/docs/', k: '文档', n: '租卡 / 传文件 / 开机实操' },
      { t: 'ComfyUI 官方文档', u: 'https://docs.comfy.org/', k: '文档', n: '先跑通官方示例再说' }
    ]
  },
  dm1: {
    hours: 60,
    fast: '一个批量出图脚本 + 一个图片处理脚本。够进下一关。',
    content: [
      'Python 基础 + numpy / PIL / opencv 读写图像',
      'argparse：把脚本变成「能带参数跑」的小工具',
      '调大模型 API：requests 发 messages，key 放环境变量',
      '调 diffusers：换模型、换提示词、循环 seed 批量出图',
      '批量出图 + 自动命名 + 参数写进 CSV',
      'API Key 与环境变量：别写死在代码里'
    ],
    resources: [
      { t: 'Diffusers 文档', u: 'https://huggingface.co/docs/diffusers', k: '文档', n: '按需查，不要通读' },
      { t: 'Automate the Boring Stuff', u: 'https://automatetheboringstuff.com/', k: '书', n: '写小工具的最快路径' },
      { t: 'Hugging Face 课程总入口', u: 'https://huggingface.co/learn', k: '课', n: 'NLP / Diffusion / Agents 都有' },
      { t: 'DeepSeek API 文档', u: 'https://api-docs.deepseek.com/', k: '文档', n: '免费额度足够跑通第一个小工具' }
    ]
  },
  dm2: {
    hours: 140,
    fast: '精读 DDPM 一篇 + 在 MNIST 上训出一个能出图的模型。别的先不追。',
    content: [
      '前向加噪 / 反向去噪，「预测噪声」到底在预测什么',
      'DDPM → DDIM → 采样器（Euler / DPM++），为什么步数能减少',
      'Latent Diffusion：VAE 压到 latent 空间，为什么能快十倍',
      'CFG 的公式含义，scale 调高为什么更「听话」也更容易崩',
      'UNet（SD1.5/SDXL）vs DiT（SD3/Flux/视频模型），CLIP / T5 文本编码',
      '训练三件套：数据集、loss、显存（batch / 梯度累积 / 混合精度）'
    ],
    resources: [
      { t: 'Lilian Weng《What are Diffusion Models?》', u: 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/', k: '文', n: '最好的入门综述，先看这个' },
      { t: 'HuggingFace Diffusion 课程', u: 'https://huggingface.co/learn/diffusion-course', k: '课', n: '带代码，第 2 关主教材' },
      { t: '李宏毅 · 生成式 AI 导论', u: 'https://speech.ee.ntu.edu.tw/~hylee/genai/2024-spring.php', k: '课', n: '中文，讲得极清楚' },
      { t: 'DDPM 论文', u: 'https://arxiv.org/abs/2006.11239', k: '论文', n: '精读的第一篇' },
      { t: 'Karpathy · Zero to Hero', u: 'https://karpathy.ai/zero-to-hero.html', k: '课', n: '想把训练循环写明白就看' }
    ]
  },
  dm3: {
    hours: 240,
    fast: '写一个 ComfyUI 节点 + 训一个 LoRA。视频和 3D 可以后补，但这两件必须有。',
    content: [
      'ComfyUI 节点：INPUT_TYPES / RETURN_TYPES / 缓存 / 种子',
      '/prompt + WebSocket：把 ComfyUI 当后端服务调',
      'LoRA：数据集打标、rank / lr / epoch、过拟合的判据',
      'ControlNet / IP-Adapter：人物与风格一致性',
      '视频：首尾帧 + RIFE / FILM 插帧解决闪烁',
      '3D：图生 3D、3DGS 训练、减面与重拓扑',
      'Blender：导出深度 / 法线 / 分割 / OpenPose',
      '资源管理：目录与命名、版本管理（Git LFS / DVC）、素材库、生成参数记录',
      '成本核算：每张图、每秒视频多少钱'
    ],
    resources: [
      { t: 'sd-scripts（LoRA 训练）', u: 'https://github.com/kohya-ss/sd-scripts', k: '工具', n: '工业标准，先跑官方示例' },
      { t: 'ControlNet', u: 'https://github.com/lllyasviel/ControlNet', k: '工具', n: '看懂条件是怎么注入的' },
      { t: 'ComfyUI Manager', u: 'https://github.com/ltdrdata/ComfyUI-Manager', k: '工具', n: '发布节点的入口' },
      { t: '3DGS 官方实现', u: 'https://github.com/graphdeco-inria/gaussian-splatting', k: '论文', n: '3DGS 从这里开始' },
      { t: 'Wan2.1（开源视频生成）', u: 'https://github.com/Wan-Video/Wan2.1', k: '工具', n: '能本地跑的视频模型' },
      { t: 'Git LFS', u: 'https://git-lfs.com/', k: '工具', n: '大文件（模型/素材）不进普通 Git' },
      { t: 'Eagle', u: 'https://eagle.cool/', k: '工具', n: '素材库：标签检索，比文件夹强' }
    ]
  },
  dm4: {
    hours: 240,
    fast: '一条管线包成 Web 服务并部署上线。先能跑，再谈优化。',
    content: [
      'FastAPI + 任务队列 + 状态轮询 + 失败重试',
      'Docker 打包 GPU 服务、域名与 HTTPS',
      'fp8 / int4、xformers、TensorRT 的取舍',
      '并发与排队：显存决定你的吞吐上限',
      '成本核算：元 / 张、元 / 秒，以及怎么压下来',
      'LLM 服务化：Ollama / DeepInfer / vLLM，吞吐与单次成本核算',
      '达芬奇：ACES、Log → Rec709、多源素材一致性调色'
    ],
    resources: [
      { t: 'Gradio 快速开始', u: 'https://www.gradio.app/guides/quickstart', k: '工具', n: '一晚上做出能点的界面' },
      { t: 'Diffusers 显存优化', u: 'https://huggingface.co/docs/diffusers/optimization/fp16', k: '文档', n: 'fp16 / offload / 量化都在这里' },
      { t: '达芬奇官方培训', u: 'https://www.blackmagicdesign.com/products/davinciresolve/training', k: '课', n: '免费 PDF + 练习素材' },
      { t: 'DeepInfer', u: 'https://github.com/deepseek-ai/DeepInfer', k: '工具', n: '部署 LLM 服务时，先跑 README 示例' }
    ]
  },
  dmai: {
    hours: 70,
    fast: '调通一次 API + 本地跑通 7B + 做一个 RAG 问答。三件做完再谈微调。',
    content: [
      '大模型怎么工作：token、上下文窗口、预训练 / 后训练、推理模式',
      'API 调用：messages 结构、temperature、stream、function calling',
      'RAG：文档切片、embedding 检索、重排、引用溯源',
      'Agent：工具定义、多步规划、失败重试、MCP',
      '本地部署：Ollama、GGUF / int4 量化、显存估算',
      '推理框架：DeepInfer / vLLM 的吞吐、延迟与成本换算'
    ],
    resources: [
      { t: 'DeepSeek 开放平台文档', u: 'https://api-docs.deepseek.com/', k: '文档', n: '有免费额度，先跑通一次对话与流式输出' },
      { t: 'Ollama', u: 'https://ollama.com/', k: '工具', n: '一行命令在本地跑 7B，先体验再说' },
      { t: 'DeepInfer（DeepSeek 开源推理框架）', u: 'https://github.com/deepseek-ai/DeepInfer', k: '工具', n: '2026 年 10 月开源，兼容 NVIDIA 与昇腾' },
      { t: 'Hugging Face Agents 课程', u: 'https://huggingface.co/learn/agents-course', k: '课', n: '带代码，Agent 入门最省时间' },
      { t: 'Lilian Weng · LLM Powered Autonomous Agents', u: 'https://lilianweng.github.io/posts/2023-06-23-agent/', k: '文', n: '把 Agent 的规划 / 记忆 / 工具讲透' }
    ]
  },

  dm5: {
    hours: 90,
    fast: '读一个大项目 + 讲一次 30 分钟。剩下的边工作边补。',
    content: [
      '读陌生项目：入口 → 管线 → 模型加载 → 后处理',
      '线上排查：显存泄漏、队列堆积、冷启动慢',
      '面试表达：为什么这么做、踩了什么坑、怎么量化',
      '项目维护：issue、版本、回归测试'
    ],
    resources: [
      { t: 'Google 工程实践（Code Review）', u: 'https://google.github.io/eng-practices/', k: '文档', n: 'review 的行业标准' },
      { t: 'Software Engineering at Google', u: 'https://abseil.io/resources/swe-book', k: '书', n: '免费在线' },
      { t: 'GitHub Skills', u: 'https://skills.github.com/', k: '练', n: '边做边学 CI' }
    ]
  },

  /* ---------------- 数媒副线 ---------------- */
  dma: {
    hours: 90,
    fast: '跑通 TinyRenderer + 能说清线性/sRGB。剩下两条边做边补。',
    content: [
      '光栅化：MVP 变换 → 三角形 → 深度测试 → 着色',
      '光照：法线、Lambert / Blinn-Phong、纹理采样',
      '线性 vs sRGB、gamma、色彩管理（90% 的颜色事故在这）',
      'PBR：金属度 / 粗糙度 / 能量守恒',
      '采样与降噪：AI 视频闪烁的成因',
      '3DGS 与 NeRF：显式高斯基元 vs 隐式场'
    ],
    resources: [
      { t: 'GAMES101 课程主页', u: 'https://games-cn.org/intro-graphics/', k: '课', n: '只刷前 8 讲，别贪' },
      { t: 'TinyRenderer', u: 'https://github.com/ssloy/tinyrenderer/wiki', k: '练', n: '500 行手写软渲染器' },
      { t: 'The Book of Shaders（中文）', u: 'https://thebookofshaders.com/?lan=ch', k: '课', n: 'GLSL 从这里入门' },
      { t: 'Shadertoy', u: 'https://www.shadertoy.com/', k: '练', n: '看别人的 shader，然后改' }
    ]
  },
  dmb: {
    hours: 70,
    fast: '能调出一条统一色调的 60 秒成片。PS 只学蒙版和曲线。',
    content: [
      'PS：图层、蒙版、通道、曲线、可选颜色',
      'PS：局部重绘与一致性修补（AI 图的最后 10%）',
      '达芬奇：一级 / 二级调色、示波器读图',
      '达芬奇：Fusion 节点合成、输出编码与平台规范',
      'Blender：渲染 Pass 与遮罩导出'
    ],
    resources: [
      { t: '达芬奇官方培训', u: 'https://www.blackmagicdesign.com/products/davinciresolve/training', k: '课', n: '免费，含练习素材' },
      { t: 'Blender 渲染 Pass 文档', u: 'https://docs.blender.org/manual/zh-hans/latest/render/layers/passes.html', k: '文档', n: '导 ControlNet 数据的关键一页' },
      { t: 'Photoshop 官方教程', u: 'https://helpx.adobe.com/cn/photoshop/tutorials.html', k: '课', n: '只看蒙版 / 通道 / 曲线 / 调色' }
    ]
  }
};

/* 合并进主数据 */
(function () {
  var D = window.GAME_DATA, E = window.GAME_EXTRA;
  if (!D) return;
  D.worlds.forEach(function (w) {
    w.stages.forEach(function (s) {
      var e = E[s.id];
      if (!e) return;
      s.hours = e.hours;
      s.fast = e.fast;
      s.content = e.content;
      s.resources = e.resources;
      /* 总工时 */
      w.hours = (w.hours || 0) + e.hours;
    });
  });
})();
