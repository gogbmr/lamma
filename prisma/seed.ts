// prisma/seed.ts
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";
import { auth } from "../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function main() {
  console.log("🌱 Starting enterprise-scale Finlamma database seeding...");

  // ==========================================
  // 1. CLEAN OLD DATA (Reverse order of dependencies)
  // ==========================================
  console.log("🧹 Clearing existing records...");
  await prisma.pushSubscription.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.newsFeed.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.fiatTransaction.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.quizGroup.deleteMany();
  await prisma.courseReview.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // 2. SEED CORE BADGES
  // ==========================================
  console.log("🏅 Seeding badges...");
  const badgeFirstProfit = await prisma.badge.create({
    data: { name: "First Green Day", description: "Closed your very first profitable mock trade.", icon: "trending-up", condition: "PROFIT_TRADES >= 1" },
  });
  const badgeStreakMaster = await prisma.badge.create({
    data: { name: "Unstoppable", description: "Maintained a learning streak of 10 days or more.", icon: "zap", condition: "STREAK >= 10" },
  });
  const badgeCourseGraduate = await prisma.badge.create({
    data: { name: "Certified Scholar", description: "Fully completed at least one structural course.", icon: "award", condition: "COMPLETED_COURSES >= 1" },
  });

  // ==========================================
  // 3. SEED REQUESTED ADMIN ACCOUNT
  // ==========================================
  console.log("👑 Seeding Main Admin User with Better Auth native hashing...");

  const authResponse = await auth.api.signUpEmail({
    body: {
      email: "deepakbmr07@gmail.com",
      password: "Admin@#12345",
      name: "Deepak van",
    },
  });

  if (!authResponse || !authResponse.user) {
    throw new Error("Failed to create admin user through Better Auth");
  }

  await prisma.user.update({
    where: { id: authResponse.user.id },
    data: {
      emailVerified: true,
      username: "deepak_admin",
      displayUsername: "Deepak (Admin)",
    },
  });

  // 3. Use UPSERT to handle auto-created profiles gracefully
  const adminProfileData = {
    role: "admin",
    permissions: ["MANAGE_USERS", "MANAGE_COURSES", "APPROVE_COURSES", "MANAGE_FINANCES", "VIEW_ANALYTICS", "MANAGE_SETTINGS"],
    virtualFiatBalance: 2500000,
    llamacoinBalance: 75000,
    xp: 25000,
    level: 42,
    streak: 5,
  };

  const adminProfile = await prisma.userProfile.upsert({
    where: { userId: authResponse.user.id },
    update: adminProfileData,
    create: { userId: authResponse.user.id, ...adminProfileData },
  });

  const adminProfileId = adminProfile.id;

  // ==========================================
  // 4. SEED TUTORS
  // ==========================================
  console.log("👨‍🏫 Seeding expert market tutors...");
  const tutorStockPro = await prisma.tutor.create({ data: { name: "Aniket Sharma", bio: "Former hedge fund derivatives trader.", avatar: "tutor-aniket.png", createdById: adminProfileId } });
  const tutorCryptoGuru = await prisma.tutor.create({ data: { name: "Elena Rostova", bio: "Blockchain architect and digital assets analyst.", avatar: "tutor-elena.png", createdById: adminProfileId } });
  const tutorMacroWealth = await prisma.tutor.create({ data: { name: "David Chen", bio: "Certified Financial Planner focusing on long-term compounding.", avatar: "tutor-david.png", createdById: adminProfileId } });

  const generateLesson = (num: number, title: string, topic: string, videoUrl: string, question: string, options: string[], answer: string) => ({
    title, topic, module: `Module ${Math.ceil(num / 3)}: Fundamentals`, lessonNumber: num, description: `A 60-second deep dive into ${topic}.`,
    videoUrl, xpReward: 100, quizXpReward: 50,
    quizzes: { create: [{ question, options, correctAnswer: answer }] }
  });

  // ==========================================
  // 5. SEED 5 COURSES
  // ==========================================
  console.log("📚 Seeding 5 courses with 10 lessons each (50 total lessons)...");

  const course1 = await prisma.course.create({
    data: {
      title: "Stock Market Blueprint", description: "Master stock analysis basics, order books, and price discovery.", order: 1, xpReward: 1000, icon: "trending-up", status: "APPROVED", authorId: adminProfileId, tutorId: tutorStockPro.id,
      lessons: {
        create: [
          generateLesson(1, "What is an Equity Share?", "Introduction to Equities", "https://www.youtube.com/embed/ZCFkWDY_6W8", "What does a stock represent?", ["Debt", "Ownership", "Insurance", "Taxes"], "Ownership"),
          generateLesson(2, "The Order Book", "Market Microstructure", "https://www.youtube.com/embed/R0fE9NlE_b8", "What is the highest price a buyer will pay called?", ["Ask", "Spread", "Bid", "Volume"], "Bid"),
          generateLesson(3, "Market Capitalization", "Valuation Basics", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "How is Market Cap calculated?", ["Share Price x Total Shares", "Revenue - Debt", "Profit x 10", "Assets / Liabilities"], "Share Price x Total Shares"),
          generateLesson(4, "Bull vs Bear Markets", "Market Cycles", "https://www.youtube.com/embed/hYip_Vuv8J0", "What characterizes a Bear market?", ["Rising prices", "Falling prices", "Sideways movement", "High dividends"], "Falling prices"),
          generateLesson(5, "Dividends Explained", "Income Generation", "https://www.youtube.com/embed/mK9K6mHeqXQ", "What is a dividend?", ["A stock split", "A company loan", "Profit shared with shareholders", "A tax penalty"], "Profit shared with shareholders"),
          generateLesson(6, "The P/E Ratio", "Fundamental Analysis", "https://www.youtube.com/embed/wf91rFNJKHs", "What does P/E stand for?", ["Price to Earnings", "Profit to Equity", "Price to Execution", "Public to Enterprise"], "Price to Earnings"),
          generateLesson(7, "Candlestick Anatomy", "Technical Analysis", "https://www.youtube.com/embed/ZCFkWDY_6W8", "What does the 'wick' of a candle show?", ["Opening price", "Closing price", "Price extremes (high/low)", "Volume traded"], "Price extremes (high/low)"),
          generateLesson(8, "Support & Resistance", "Chart Patterns", "https://www.youtube.com/embed/R0fE9NlE_b8", "What is a support level?", ["A price ceiling", "A price floor", "A trend reversal", "A breakout point"], "A price floor"),
          generateLesson(9, "Volume & Liquidity", "Market Flow", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "High liquidity usually means:", ["Wider spreads", "Tighter spreads", "Higher fees", "Slower execution"], "Tighter spreads"),
          generateLesson(10, "Your First Trade", "Execution", "https://www.youtube.com/embed/hYip_Vuv8J0", "A 'Market Order' executes at:", ["A specific limit price", "The best available current price", "The closing price", "The opening price"], "The best available current price"),
        ]
      }
    }, include: { lessons: true }
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Futures & Options Masterclass", description: "Deep dive into leveraged derivative hedging and option contracts.", order: 2, xpReward: 1500, icon: "activity", status: "APPROVED", authorId: adminProfileId, tutorId: tutorStockPro.id,
      lessons: {
        create: [
          generateLesson(1, "Intro to Derivatives", "Derivatives Basics", "https://www.youtube.com/embed/mK9K6mHeqXQ", "Derivatives derive their value from:", ["Underlying assets", "Interest rates only", "Inflation", "Company PR"], "Underlying assets"),
          generateLesson(2, "Call Options", "Options Contracts", "https://www.youtube.com/embed/wf91rFNJKHs", "A Call option gives you the right to:", ["Sell", "Buy", "Hold", "Short"], "Buy"),
          generateLesson(3, "Put Options", "Options Contracts", "https://www.youtube.com/embed/ZCFkWDY_6W8", "You buy a Put option when you expect the market to go:", ["Up", "Down", "Sideways", "Nowhere"], "Down"),
          generateLesson(4, "Futures Contracts", "Futures Basics", "https://www.youtube.com/embed/R0fE9NlE_b8", "Futures contracts represent an:", ["Option", "Obligation", "Insurance", "Equity"], "Obligation"),
          generateLesson(5, "Option Premiums", "Pricing Mechanics", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "Option premium is primarily made of:", ["Intrinsic & Extrinsic value", "Debt & Equity", "Bid & Ask", "Volume & Price"], "Intrinsic & Extrinsic value"),
          generateLesson(6, "Strike Prices & Expiry", "Contract Terms", "https://www.youtube.com/embed/hYip_Vuv8J0", "What happens to options at expiry if out-of-the-money?", ["They roll over", "They expire worthless", "They convert to shares", "They trigger a margin call"], "They expire worthless"),
          generateLesson(7, "ITM, OTM, ATM", "Moneyness", "https://www.youtube.com/embed/mK9K6mHeqXQ", "If strike price = current price, the option is:", ["ITM", "OTM", "ATM", "BTM"], "ATM"),
          generateLesson(8, "The Greeks: Delta", "Risk Metrics", "https://www.youtube.com/embed/wf91rFNJKHs", "Delta measures sensitivity to:", ["Time", "Volatility", "Interest Rates", "Underlying Asset Price"], "Underlying Asset Price"),
          generateLesson(9, "The Greeks: Theta", "Time Decay", "https://www.youtube.com/embed/ZCFkWDY_6W8", "Theta represents:", ["Time decay", "Volatility", "Price change", "Leverage ratio"], "Time decay"),
          generateLesson(10, "Basic Hedging", "Strategies", "https://www.youtube.com/embed/R0fE9NlE_b8", "Hedging is primarily used to:", ["Maximize profit", "Minimize risk", "Increase leverage", "Avoid taxes"], "Minimize risk"),
        ]
      }
    }, include: { lessons: true }
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Crypto and Web3 Economics", description: "Deconstruct trustless distributed Ledgers and token utility.", order: 3, xpReward: 1200, icon: "bitcoin", status: "APPROVED", authorId: adminProfileId, tutorId: tutorCryptoGuru.id,
      lessons: {
        create: [
          generateLesson(1, "Blockchain Basics", "Consensus", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "A blockchain is essentially a:", ["Private database", "Distributed public ledger", "Local server", "Cloud storage drive"], "Distributed public ledger"),
          generateLesson(2, "What is Bitcoin?", "Digital Gold", "https://www.youtube.com/embed/hYip_Vuv8J0", "Bitcoin's maximum supply cap is:", ["10 Million", "21 Million", "100 Million", "Infinite"], "21 Million"),
          generateLesson(3, "Ethereum & Smart Contracts", "Web3 Infrastructure", "https://www.youtube.com/embed/mK9K6mHeqXQ", "Smart contracts execute automatically when:", ["Miners approve", "Conditions are met", "Gas fees drop", "A user logs in"], "Conditions are met"),
          generateLesson(4, "Hot vs Cold Wallets", "Self-Custody", "https://www.youtube.com/embed/wf91rFNJKHs", "Which wallet type is completely offline?", ["Hot Wallet", "Cold Wallet", "Exchange Wallet", "Web Wallet"], "Cold Wallet"),
          generateLesson(5, "Understanding Gas Fees", "Network Costs", "https://www.youtube.com/embed/ZCFkWDY_6W8", "Gas fees are paid to:", ["Founders", "Miners/Validators", "Exchanges", "Governments"], "Miners/Validators"),
          generateLesson(6, "DeFi Basics", "Decentralized Finance", "https://www.youtube.com/embed/R0fE9NlE_b8", "DeFi eliminates the need for:", ["Internet", "Tokens", "Central intermediaries (banks)", "Smart contracts"], "Central intermediaries (banks)"),
          generateLesson(7, "Stablecoins Explained", "Volatility Anchors", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "Stablecoins are typically pegged to:", ["Gold", "Bitcoin", "Fiat currencies like the USD", "Ethereum"], "Fiat currencies like the USD"),
          generateLesson(8, "Proof of Work vs Stake", "Consensus Mechanisms", "https://www.youtube.com/embed/hYip_Vuv8J0", "Which mechanism uses computing power to solve puzzles?", ["Proof of Stake", "Proof of History", "Proof of Work", "Proof of Authority"], "Proof of Work"),
          generateLesson(9, "Tokenomics", "Supply and Demand", "https://www.youtube.com/embed/mK9K6mHeqXQ", "A deflationary token mechanism often involves:", ["Minting more tokens", "Token burning", "Increasing staking yields", "Lowering gas fees"], "Token burning"),
          generateLesson(10, "Crypto Security", "Risk Management", "https://www.youtube.com/embed/wf91rFNJKHs", "The most important rule of self-custody is:", ["Share your seed phrase", "Never share your seed phrase", "Store passwords on Google Drive", "Use simple passwords"], "Never share your seed phrase"),
        ]
      }
    }, include: { lessons: true }
  });

  const course4 = await prisma.course.create({
    data: {
      title: "Commodities & Forex Strategy", description: "Understand global spot trading for currency pairs and raw materials.", order: 4, xpReward: 1400, icon: "globe", status: "APPROVED", authorId: adminProfileId, tutorId: tutorStockPro.id,
      lessons: {
        create: [
          generateLesson(1, "Forex Pip Mechanics", "Currency Pairs", "https://www.youtube.com/embed/ZCFkWDY_6W8", "What does PIP stand for?", ["Price Interest Point", "Percentage in Point", "Profit in Pricing", "Position Index Price"], "Percentage in Point"),
          generateLesson(2, "Major vs Minor Pairs", "Market Liquidity", "https://www.youtube.com/embed/R0fE9NlE_b8", "Major currency pairs always include:", ["EUR", "JPY", "USD", "GBP"], "USD"),
          generateLesson(3, "Leverage in Forex", "Margin Trading", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "High leverage:", ["Decreases risk", "Has no effect", "Magnifies both profits and losses", "Guarantees returns"], "Magnifies both profits and losses"),
          generateLesson(4, "Interest Rates & Forex", "Central Banks", "https://www.youtube.com/embed/hYip_Vuv8J0", "Usually, when a country raises interest rates, its currency:", ["Weakens", "Strengthens", "Crashes", "Remains unaffected"], "Strengthens"),
          generateLesson(5, "Gold (XAU) Dynamics", "Safe Havens", "https://www.youtube.com/embed/mK9K6mHeqXQ", "Gold is historically seen as a hedge against:", ["Tech stocks", "Inflation", "Real estate", "Deflation"], "Inflation"),
          generateLesson(6, "Crude Oil Trading", "Energy Markets", "https://www.youtube.com/embed/wf91rFNJKHs", "Which organization heavily influences oil supply?", ["WHO", "NATO", "OPEC", "WTO"], "OPEC"),
          generateLesson(7, "Agricultural Commodities", "Soft Commodities", "https://www.youtube.com/embed/ZCFkWDY_6W8", "Which of these is a 'soft' commodity?", ["Gold", "Silver", "Coffee", "Copper"], "Coffee"),
          generateLesson(8, "Reading Forex Quotes", "Bid/Ask Mechanics", "https://www.youtube.com/embed/R0fE9NlE_b8", "In EUR/USD, EUR is the:", ["Quote currency", "Base currency", "Minor currency", "Fiat currency"], "Base currency"),
          generateLesson(9, "Economic Calendar", "Fundamental News", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "NFP (Non-Farm Payroll) is a major data release from:", ["EU", "UK", "USA", "Japan"], "USA"),
          generateLesson(10, "Managing Margin Calls", "Risk Controls", "https://www.youtube.com/embed/hYip_Vuv8J0", "A margin call occurs when:", ["You make a profit", "Account equity drops below required margin", "You close a trade", "You withdraw funds"], "Account equity drops below required margin"),
        ]
      }
    }, include: { lessons: true }
  });

  const course5 = await prisma.course.create({
    data: {
      title: "Personal Portfolio Architecture", description: "Construct balanced portfolios through structural compounding.", order: 5, xpReward: 1100, icon: "pie-chart", status: "APPROVED", authorId: adminProfileId, tutorId: tutorMacroWealth.id,
      lessons: {
        create: [
          generateLesson(1, "Power of Compounding", "Growth Mechanics", "https://www.youtube.com/embed/mK9K6mHeqXQ", "Compounding is earning return on:", ["Principal only", "Principal and accumulated interest", "Taxes", "Inflation"], "Principal and accumulated interest"),
          generateLesson(2, "Asset Allocation Basics", "Portfolio Sizing", "https://www.youtube.com/embed/wf91rFNJKHs", "Asset allocation means dividing money among:", ["Different brokers", "Different asset classes (Stocks, Bonds, Cash)", "Different bank accounts", "Different cryptocurrencies only"], "Different asset classes (Stocks, Bonds, Cash)"),
          generateLesson(3, "Risk Tolerance", "Investor Psychology", "https://www.youtube.com/embed/ZCFkWDY_6W8", "A younger investor typically has a:", ["Lower risk tolerance", "Higher risk tolerance", "Zero risk tolerance", "Negative risk tolerance"], "Higher risk tolerance"),
          generateLesson(4, "Diversification", "Risk Mitigation", "https://www.youtube.com/embed/R0fE9NlE_b8", "Diversification is best described as:", ["Putting all eggs in one basket", "Not putting all eggs in one basket", "Buying only tech stocks", "Keeping all money in cash"], "Not putting all eggs in one basket"),
          generateLesson(5, "Rebalancing", "Portfolio Maintenance", "https://www.youtube.com/embed/7Vp89VlZ-0Q", "Rebalancing involves:", ["Buying more of the winners only", "Selling everything", "Restoring portfolio to target allocations", "Ignoring market changes"], "Restoring portfolio to target allocations"),
          generateLesson(6, "Emergency Funds", "Liquidity", "https://www.youtube.com/embed/hYip_Vuv8J0", "A standard emergency fund covers expenses for:", ["1 week", "3-6 months", "5 years", "10 years"], "3-6 months"),
          generateLesson(7, "Taxes on Investments", "Capital Gains", "https://www.youtube.com/embed/mK9K6mHeqXQ", "Long-term capital gains are usually taxed:", ["Higher than short-term", "Lower than short-term", "The same as short-term", "Not taxed at all"], "Lower than short-term"),
          generateLesson(8, "Inflation's Impact", "Purchasing Power", "https://www.youtube.com/embed/wf91rFNJKHs", "Inflation causes the purchasing power of cash to:", ["Increase", "Decrease", "Stay the same", "Double"], "Decrease"),
          generateLesson(9, "Active vs Passive", "Investment Styles", "https://www.youtube.com/embed/ZCFkWDY_6W8", "Index funds are an example of:", ["Active investing", "Passive investing", "Day trading", "Arbitrage"], "Passive investing"),
          generateLesson(10, "Setting Financial Goals", "Planning", "https://www.youtube.com/embed/R0fE9NlE_b8", "SMART goals stand for:", ["Specific, Measurable, Achievable, Relevant, Time-bound", "Simple, Money, Assets, Return, Taxes", "Stocks, Mutuals, Alternatives, Real-estate, Treasuries", "Safe, Marginal, Absolute, Rated, Tiered"], "Specific, Measurable, Achievable, Relevant, Time-bound"),
        ]
      }
    }, include: { lessons: true }
  });

  // ==========================================
  // 6. SEED 10 USERS WITH DIVERSE ENROLLMENTS
  // ==========================================
  console.log("👥 Seeding 10 student profiles, generating hashes, and mapping 10-lesson progress grids...");

  const allCourses = [course1, course2, course3, course4, course5];

  const studentsData = [
    { name: "Chirag Sharma", email: "chirag@example.com", user: "chirag_trades", balance: 650000, coins: 4500, xp: 8200, level: 8, streak: 12 },
    { name: "Aarav Mehta", email: "aarav@example.com", user: "aarav_alpha", balance: 420000, coins: 1200, xp: 3100, level: 3, streak: 4 },
    { name: "Priya Patel", email: "priya@example.com", user: "priya_options", balance: 980000, coins: 9400, xp: 14500, level: 14, streak: 28 },
    { name: "Rohan Das", email: "rohan@example.com", user: "rohan_crypto", balance: 120000, coins: 650, xp: 1200, level: 2, streak: 1 },
    { name: "Sneha Reddy", email: "sneha@example.com", user: "sneha_green", balance: 500000, coins: 2100, xp: 5400, level: 5, streak: 9 },
    { name: "Vikram Malhotra", email: "vikram@example.com", user: "vikram_fno", balance: 1550000, coins: 18000, xp: 29000, level: 25, streak: 45 },
    { name: "Ananya Iyer", email: "ananya@example.com", user: "ananya_wealth", balance: 710000, coins: 3400, xp: 7100, level: 7, streak: 11 },
    { name: "Kabir Singh", email: "kabir@example.com", user: "kabir_bull", balance: 340000, coins: 800, xp: 1900, level: 2, streak: 3 },
    { name: "Meera Nair", email: "meera@example.com", user: "meera_quant", balance: 890000, coins: 5200, xp: 9900, level: 9, streak: 16 },
    { name: "Aditya Verma", email: "aditya@example.com", user: "aditya_fx", balance: 520000, coins: 2900, xp: 4300, level: 4, streak: 7 },
  ];

  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    
    const targetCourse = allCourses[i % allCourses.length];
    
    const authResponse = await auth.api.signUpEmail({
      body: {
        email: s.email,
        password: "StudentPass#123",
        name: s.name,
      },
    });

    if (!authResponse || !authResponse.user) {
      console.error(`Failed to create user: ${s.email}`);
      continue;
    }

    await prisma.user.update({
      where: { id: authResponse.user.id },
      data: {
        emailVerified: true, 
        username: s.user, 
        displayUsername: `${s.name} 🚀`,
      },
    });

    // 3. UPSERT for students as well
    const studentProfileData = {
      role: "user", 
      virtualFiatBalance: s.balance, 
      llamacoinBalance: s.coins, 
      xp: s.xp, 
      level: s.level, 
      streak: s.streak,
      currentCourseId: targetCourse.id, 
      currentLessonId: targetCourse.lessons[0].id, 
      avatar: `avatar-${(i % 5) + 1}.png`, 
      lastActiveDate: new Date(),
    };

    const studentProfile = await prisma.userProfile.upsert({
      where: { userId: authResponse.user.id },
      update: studentProfileData,
      create: { userId: authResponse.user.id, ...studentProfileData }
    });

    const profId = studentProfile.id;

    // --- Dynamic Lesson Progress Generation ---
    const lessonsToComplete = s.level > 6 ? 10 : Math.max(1, Math.floor(s.level / 1.5));
    
    for (let j = 0; j < lessonsToComplete; j++) {
      const lesson = targetCourse.lessons[j];
      await prisma.userProgress.create({
        data: {
          profileId: profId, lessonId: lesson.id,
          completed: true, lessonCompleted: true, quizCompleted: true,
          score: 100, timeSpent: 110 + (j * 10), completedAt: new Date()
        }
      });
    }

    if (lessonsToComplete === 10) {
      await prisma.userBadge.create({ data: { profileId: profId, badgeId: badgeCourseGraduate.id } });
    }
    if (s.streak >= 10) {
      await prisma.userBadge.create({ data: { profileId: profId, badgeId: badgeStreakMaster.id } });
    }

    // --- Trading & History ---
    const isProfitable = i % 2 === 0;
    const pnl = isProfitable ? 12500 * (i + 1) : -4500 * (i + 1);

    await prisma.trade.create({
      data: {
        profileId: profId, segment: i % 2 === 0 ? "Equity" : "FNO", symbol: i % 2 === 0 ? "RELIANCE" : "NIFTY26JUNFUT",
        orderType: "BUY", quantity: 50 * (i + 1), entryPrice: 2400.00, exitPrice: 2400.00 + (pnl / (50 * (i + 1))),
        status: "CLOSED", profitLoss: pnl,
      }
    });

    if (isProfitable) {
      await prisma.userBadge.create({ data: { profileId: profId, badgeId: badgeFirstProfit.id } });
    }

    await prisma.walletTransaction.create({ data: { profileId: profId, currency: "VIRTUAL_INR", source: "QUIZ_REWARD", amount: 500, balanceAfter: s.balance } });
    await prisma.leaderboard.create({ data: { profileId: profId, segment: "Equity", username: s.user, totalProfit: pnl > 0 ? pnl : 0, winRate: pnl > 0 ? 75.5 : 33.3, period: "WEEKLY", rank: i + 1 } });
    await prisma.notification.create({ data: { profileId: profId, title: "Welcome aboard Finlamma!", message: "Your paper balance of ₹5,00,000 INR simulation limits are now active.", type: "SYSTEM" } });
  }
  
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Cleanly shut down the pool connection
  });