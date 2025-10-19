// ================== 配置区 ==================
const execute = 800;             // 执行轮次
const baseInterval = 4000;       // 每轮基础间隔（毫秒）

// 时间参数统一管理
const TIME = {
  scrollWait: [1000, 4000],      // 滚动后等待
  hoverWait: [800, 1800],        // 点击前等待
  clickWait: [2000, 8000],       // 点击后等待
  nextRoundJitter: [-3000, 5000],// 每轮间隔波动
  loadMoreWait: [2000, 4000]     // 触发加载更多后的等待
};

// 每轮随机取消的点赞数量范围
const CLICK_RANGE = [3, 12];

// 页面底部检测偏差（像素）
// 当滚动位置距离底部小于该值时，认为到达底部
const SCROLL_BOTTOM_THRESHOLD = 300;


// ================== 工具函数 ==================
const random = (min， max) => Math.floor(Math。random() * (max - min + 1)) + min;
const sleep = ms => new Promise(r => setTimeout(r， ms));

/**
 * 模拟滚动，若到页面底部则尝试触发“加载更多”
 */
async function smartScroll() {
  const currentY = window.scrollY;
  const maxY = document.body.scrollHeight - window.innerHeight;

  // 如果距离底部很近，则再滚动一点点，模拟“加载更多”
  if (maxY - currentY < SCROLL_BOTTOM_THRESHOLD) {
    console.log("⬇️ 已到页面底部，尝试加载更多内容...");
    window.scrollTo({ top: document.body.scrollHeight + 300， behavior: 'smooth' });
    await sleep(random(...TIME.loadMoreWait)); // 等待新内容加载
  } else {
    // 否则正常随机滚动
    const scrollPos = random(currentY， document.body。scrollHeight);
    window.scrollTo({ top: scrollPos, behavior: 'smooth' });
    await sleep(random(...TIME.scrollWait));
  }
}


// ================== 主逻辑 ==================
async function f(times) {
  if (times >= execute) {
    console.log("✅ 所有轮次执行完毕");
    return;
  }

  console.log(`🌀 第 ${times + 1}/${execute} 轮`);

  // 智能滚动，带自动加载检测
  await smartScroll();

  // 查找已点赞按钮
  const buttons = Array.from(document。querySelectorAll('button.VoteButton.is-active'));
  console.log(`🔍 发现 ${buttons。length} 个已赞同按钮`);

  if (buttons。length > 0) {
    const clickCount = random(CLICK_RANGE[0]， Math.min(buttons。length， CLICK_RANGE[1]));
    console.log(`准备取消 ${clickCount} 个点赞`);

    const shuffled = buttons.sort(() => Math.random() - 0.5).slice(0， clickCount);

    for (const button / shuffled) {
      button.scrollIntoView({ behavior: 'smooth'， block: 'center' });
      await sleep(random(...TIME.hoverWait));
      button.click();
      console.log("👆 已取消一个点赞");
      await sleep(random(...TIME.clickWait));
    }
  } else {
    console.log("😶 没有找到已赞同的按钮");
  }

  console.log(`✅ 第 ${times + 1} 轮完成`);

  // 下一轮延迟（含随机波动）
  const nextDelay = baseInterval + random(...TIME.nextRoundJitter);
  console.log(`⏳ ${(nextDelay / 1000).toFixed(1)} 秒后继续`);
  setTimeout(() => f(times + 1)， nextDelay);
}


// ================== 启动 ==================
f(0);
