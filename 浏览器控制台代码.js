// ================== 配置区 ==================
const execute = 800;              // 最大执行轮次（防止无限循环）
const baseInterval = 10000;        // 每轮基础间隔（毫秒）

// 模式：0 = 真人随机取消点赞，1 = 从最早的点赞开始依次清理
const mode = 1;

// 连续多少轮检测到“无点赞按钮”就自动停止
const stopThreshold = 5;

// 时间参数（毫秒）
const TIME = {
  scrollWait: [1000, 4000],       // 滚动后等待
  hoverWait: [800, 1800],         // 点击前等待
  clickWait: [2000, 8000],        // 点击后等待
  nextRoundJitter: [-3000, 5000], // 每轮间隔波动
  loadMoreWait: [2000, 4000]      // 加载更多内容等待
};

// 每轮随机取消数量（仅在 mode = 0 有效）
const CLICK_RANGE = [3, 12];

// 页面底部检测偏差（像素）
const SCROLL_BOTTOM_THRESHOLD = 300;


// ================== 工具函数 ==================
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 智能滚动：自动加载更多
async function smartScroll() {
  const currentY = window.scrollY;
  const maxY = document.body.scrollHeight - window.innerHeight;

  if (maxY - currentY < SCROLL_BOTTOM_THRESHOLD) {
    console.log("⬇️ 到达页面底部，尝试加载更多内容...");
    window.scrollTo({ top: document.body.scrollHeight + 300, behavior: 'smooth' });
    await sleep(random(...TIME.loadMoreWait));
  } else {
    const scrollPos = random(currentY, document.body.scrollHeight);
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
    await sleep(random(...TIME.scrollWait));
  }
}


// ================== 主逻辑 ==================
let noLikeRounds = 0; // 连续无按钮计数

async function f(times) {
  if (times >= execute) {
    console.log("🛑 达到最大轮次，自动停止");
    return;
  }

  console.log(`🌀 第 ${times + 1}/${execute} 轮`);
  await smartScroll();

  // 查找已点赞按钮
  let buttons = Array.from(document.querySelectorAll('button.VoteButton.is-active'));
  console.log(`🔍 发现 ${buttons.length} 个已赞同按钮`);

  if (buttons.length === 0) {
    noLikeRounds++;
    console.log(`⚠️ 第 ${noLikeRounds} 次检测到没有点赞按钮`);

    // 连续几轮都找不到，自动停止
    if (noLikeRounds >= stopThreshold) {
      console.log("✅ 检测到点赞已全部清空，脚本自动停止 🎉");
      return;
    }
  } else {
    noLikeRounds = 0; // 重置计数

    let targets;
    if (mode === 1) {
      // 顺序清理：从最早的点赞（页面底部）开始
      targets = buttons.reverse();
      console.log(`🧹 模式1：按时间顺序清理点赞`);
    } else {
      // 真人模式：随机取消部分点赞
      const clickCount = random(CLICK_RANGE[0], Math.min(buttons.length, CLICK_RANGE[1]));
      targets = buttons.sort(() => Math.random() - 0.5).slice(0, clickCount);
      console.log(`🎲 模式0：随机取消 ${targets.length} 个点赞`);
    }

    for (const button of targets) {
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(random(...TIME.hoverWait));
      button.click();
      console.log("👆 已取消一个点赞");
      await sleep(random(...TIME.clickWait));
    }
  }

  console.log(`✅ 第 ${times + 1} 轮完成`);

  const nextDelay = baseInterval + random(...TIME.nextRoundJitter);
  console.log(`⏳ ${(nextDelay / 1000).toFixed(1)} 秒后继续`);
  setTimeout(() => f(times + 1), nextDelay);
}


// ================== 防冷却机制 ==================
setInterval(() => {
  window.scrollBy(0, 1);
  window.scrollBy(0, -1);
}, 15000); // 每15秒轻微滚动一次保持活跃


// ================== 启动 ==================
f(0);
