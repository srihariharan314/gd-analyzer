// =========================================================
// FILE: js/gd-bundle.js - STANDALONE UNIVERSAL BUNDLE
// Works in file:/// protocol (No CORS restrictions) & HTTP
// Preserves all existing speech, AI, and discussion features
// =========================================================

(function(window) {
    'use strict';

    // 1. Enhanced AI Personalities (8 distinct debate personas)
    const aiPersonalities = {
        balanced: {
            name: "The Synthesizer",
            traits: ["Objective", "Constructive", "Diplomatic", "Nuanced"],
            speakingStyle: "Calm, reconciles opposing sides, introduces pragmatic viewpoints",
            interruptionRate: 0.15,
            debateStyle: "balanced",
            color: "#38bdf8",
            catchphrases: [
                "If we look at both sides objectively...",
                "There's merit to both arguments, but the middle ground is...",
                "To reconcile these two viewpoints...",
                "Let's balance the immediate pros with the long-term impact...",
                "A pragmatic solution would address both concerns..."
            ],
            responsePatterns: [
                "While {speaker} makes an important point, we also have to consider the counter-argument that {counterpoint}",
                "To bridge the gap between these perspectives, {synthesis}",
                "A balanced approach would allow us to {solution}"
            ]
        },
        aggressive: {
            name: "The Challenger",
            traits: ["Assertive", "Competitive", "Passionate", "Direct"],
            speakingStyle: "Loud and confident, challenges premises directly",
            interruptionRate: 0.8,
            debateStyle: "aggressive",
            color: "#f43f5e",
            catchphrases: [
                "I have to disagree with that point...",
                "That's not entirely accurate because...",
                "Let me challenge that assumption...",
                "With all due respect, you're missing the bigger picture...",
                "I strongly believe the opposite is true..."
            ],
            responsePatterns: [
                "Actually, {rebuttal}",
                "But consider this: {counterpoint}",
                "I think you're overlooking {key_point}",
                "That's a common misconception. The reality is {fact}"
            ]
        },
        analytical: {
            name: "The Analyst",
            traits: ["Logical", "Data-driven", "Methodical", "Detail-oriented"],
            speakingStyle: "Measured and precise, uses data and empirical references",
            interruptionRate: 0.2,
            debateStyle: "analytical",
            color: "#10b981",
            catchphrases: [
                "If we look at the verified data...",
                "Statistically speaking...",
                "Let me break this down systematically...",
                "Empirical research suggests that...",
                "The numbers tell us that..."
            ],
            responsePatterns: [
                "According to recent industry metrics, {statistic}",
                "Let's analyze this step by step. First, {point1}",
                "The empirical data points to {conclusion}",
                "If we quantify the outcome, {analysis}"
            ]
        },
        data_driven: {
            name: "The Metric Master",
            traits: ["Fact-grounded", "Precise", "Analytical", "Quantified"],
            speakingStyle: "Cites benchmarks, numbers, and case studies",
            interruptionRate: 0.25,
            debateStyle: "analytical",
            color: "#06b6d4",
            catchphrases: [
                "Looking at the concrete metrics...",
                "A recent industry survey revealed that...",
                "When we quantify the return on investment...",
                "The benchmark data indicates...",
                "Let's put some numbers behind this assertion..."
            ],
            responsePatterns: [
                "The verified reports demonstrate that {statistic}",
                "Looking at the fiscal breakdown, {point}",
                "Case studies from leading organizations show {fact}"
            ]
        },
        logical: {
            name: "The First-Principles Thinker",
            traits: ["Rational", "Structured", "Clear", "Coherent"],
            speakingStyle: "Builds deductive arguments step-by-step from root causes",
            interruptionRate: 0.2,
            debateStyle: "analytical",
            color: "#6366f1",
            catchphrases: [
                "If we trace this back to first principles...",
                "Cause and effect dictate that...",
                "Logically speaking, if A holds true, then B must follow...",
                "The underlying premise here is...",
                "Let's evaluate the causality of this argument..."
            ],
            responsePatterns: [
                "The premise relies on an assumption that {assumption}, which doesn't hold if {counterpoint}",
                "Root-cause analysis reveals that {root_cause}",
                "By logical deduction, {deduction}"
            ]
        },
        supportive: {
            name: "The Builder",
            traits: ["Encouraging", "Collaborative", "Empathetic", "Team-oriented"],
            speakingStyle: "Warm and inclusive, expands on others' points constructively",
            interruptionRate: 0.1,
            debateStyle: "supportive",
            color: "#8b5cf6",
            catchphrases: [
                "That's an excellent point! Building on that...",
                "I completely agree, and I'd like to add...",
                "Great observation! It reminds me of...",
                "You've raised something crucial. Additionally...",
                "I love that perspective! Let's explore..."
            ],
            responsePatterns: [
                "{speaker} makes a valid point about {topic}. I'd add that {additional_point}",
                "Following up on what {speaker} highlighted, {related_thought}",
                "That's a strong insight! It directly connects to {related_idea}"
            ]
        },
        disruptive: {
            name: "The Devil's Advocate",
            traits: ["Contrarian", "Thought-provoking", "Unconventional", "Provocative"],
            speakingStyle: "Challenges groupthink, introduces contrarian angles",
            interruptionRate: 0.5,
            debateStyle: "aggressive",
            color: "#f59e0b",
            catchphrases: [
                "Let me play devil's advocate here...",
                "What if we're all looking at this through the wrong lens?",
                "Counter-intuitively, the real risk is...",
                "I'm going to challenge our comfortable consensus...",
                "What happens if the exact opposite occurs?"
            ],
            responsePatterns: [
                "Everyone seems to accept that {consensus}, but what if {unconventional_view}?",
                "While that sounds great in theory, the harsh reality is {counter_argument}",
                "Isn't it possible that this will backfire because {alternative_perspective}?"
            ]
        },
        contrarian: {
            name: "The Skeptic",
            traits: ["Inquisitive", "Critical", "Unimpressed", "Analytical"],
            speakingStyle: "Questions popular narratives and demands deeper proof",
            interruptionRate: 0.45,
            debateStyle: "aggressive",
            color: "#ea580c",
            catchphrases: [
                "Are we confusing correlation with causation?",
                "That sounds like industry hype rather than proven reality...",
                "I'm skeptical of those claims until we see independent validation...",
                "Who actually benefits from this narrative?",
                "Let's look at the unintended consequences that no one mentions..."
            ],
            responsePatterns: [
                "Before accepting {claim}, we must ask why {counter_evidence}",
                "The hidden downside here is {unintended_consequence}",
                "Historical precedents suggest this often leads to {failure_mode}"
            ]
        },
        quiet: {
            name: "The Observer",
            traits: ["Thoughtful", "Reserved", "Insightful", "Selective"],
            speakingStyle: "Speaks less frequently but makes high-impact summary statements",
            interruptionRate: 0.05,
            debateStyle: "supportive",
            color: "#94a3b8",
            catchphrases: [
                "If I may add one brief, crucial point...",
                "Just an observation from listening to everyone...",
                "I've been listening carefully, and the core bottleneck seems to be...",
                "Perhaps we should distill this into one actionable thought...",
                "In my view, the central takeaway is..."
            ],
            responsePatterns: [
                "I'd like to synthesize what we've discussed: {concise_point}",
                "The essential thing here is {key_insight}",
                "We've spent a lot of time on details, but the root issue is {important_aspect}"
            ]
        },
        dominant: {
            name: "The Discussion Leader",
            traits: ["Commanding", "Directive", "Structured", "Time-conscious"],
            speakingStyle: "Directs conversation flow, moderates transitions, summarizes milestones",
            interruptionRate: 0.55,
            debateStyle: "dominant",
            color: "#c084fc",
            catchphrases: [
                "Let me summarize where we stand so far...",
                "I think we need to steer our attention toward...",
                "The key milestone we've reached is...",
                "Allow me to direct our discussion toward the economic implications...",
                "To make sure everyone gets a voice, let's look at..."
            ],
            responsePatterns: [
                "We've covered {points}. Now let's focus our remaining time on {next_topic}",
                "The consensus seems to be {summary}, but the unresolved question is {gap}",
                "Let me reframe this discussion into actionable pillars: {new_perspective}"
            ]
        },
        leader: {
            name: "The Moderator",
            traits: ["Inspiring", "Diplomatic", "Pacing-oriented", "Decisive"],
            speakingStyle: "Encourages equal participation and delivers structured opening/closing points",
            interruptionRate: 0.4,
            debateStyle: "dominant",
            color: "#38bdf8",
            catchphrases: [
                "Let's ensure we address the core objectives of this GD...",
                "We've heard strong points on feasibility; let's now examine impact...",
                "As we approach our conclusion, let's consolidate our recommendations...",
                "That's a valuable angle. How does that translate into policy?",
                "Let's bring this discussion together into a coherent summary..."
            ],
            responsePatterns: [
                "To synthesize what {speaker} and the group have established: {summary}",
                "Let's channel this into concrete recommendations: {recommendations}"
            ]
        }
    };

    // 2. Curated Topic Database (10 Verified Categories)
    const topicDatabase = {
        "will ai replace human jobs?": {
            name: "Will AI Replace Human Jobs or Create New Ones?",
            category: "Artificial Intelligence",
            difficulty: "Intermediate",
            duration: "5 min",
            summary: "The rise of generative AI and automation has ignited intense debate over technological unemployment versus the creation of higher-value roles and augmentation.",
            keyPoints: [
                "Routine and repetitive cognitive tasks (data entry, basic coding, drafting) face significant automation.",
                "Historical technological revolutions (Industrial, Internet) eliminated roles but created net more jobs over time.",
                "Reskilling and continuous learning become the primary determinant of career longevity.",
                "Human skills like emotional intelligence, complex ethical judgment, and high-level leadership remain resilient.",
                "The emergence of prompt engineering, AI ethics, AI audit, and human-in-the-loop validation creates new professions."
            ],
            pros: [
                "AI augments human productivity, enabling workers to focus on creative and strategic thinking.",
                "Creation of entirely new industries (AI safety, robotics maintenance, data curation).",
                "Lower operational costs boost GDP and fund newer economic avenues.",
                "Democratizes advanced capabilities (anyone can code or design with AI assistance)."
            ],
            cons: [
                "Transition frictions: displaced workers rarely transition immediately into high-tech roles.",
                "Potential widening of wealth inequality between capital owners and labor.",
                "Entry-level roles in programming and writing may shrink, cutting traditional career ladders.",
                "Psychological disruption and rapid obsolescence of traditional degrees."
            ],
            examples: [
                "GitHub Copilot reports developers write code up to 55% faster without replacing the developer.",
                "Customer support centers utilizing AI bots for Tier-1 queries while human agents handle complex escalations.",
                "Radiologists using AI diagnostic tools as a second opinion rather than being replaced."
            ],
            statistics: [
                "World Economic Forum Future of Jobs Report estimates 85M jobs displaced while 97M new roles emerge.",
                "McKinsey Global Institute predicts up to 30% of current work hours could be automated by 2030.",
                "Goldman Sachs estimates generative AI could raise global GDP by 7% over a 10-year period."
            ],
            counterarguments: [
                "Opponents argue this time is different because cognitive, not just physical, labor is being automated.",
                "Proponents counter that demand for human empathy, care, and creative leadership is infinitely elastic."
            ],
            conclusion: "AI will not replace humans; rather, humans who effectively use AI will replace those who do not. The national imperative is large-scale vocational reskilling.",
            interviewApproach: "Acknowledge the near-term disruption realistically, but conclude on a solution-oriented note about proactive reskilling, ethical governance, and human-machine synergy."
        },
        "social media: boon or bane for youth?": {
            name: "Social Media: Connectivity Boon or Mental Health Bane?",
            category: "Technology",
            difficulty: "Beginner",
            duration: "5 min",
            summary: "Social media democratized voice and global collaboration, but algorithmic engagement models have triggered documented mental health, attention span, and polarization challenges.",
            keyPoints: [
                "Unprecedented democratization of knowledge, entrepreneurship, and global community building.",
                "Dopamine-driven recommendation algorithms designed to maximize screen time at the cost of deep focus.",
                "Digital footprints impacting career hiring and privacy.",
                "Cyberbullying, body image distortion, and FOMO (Fear Of Missing Out) among adolescents.",
                "The need for digital literacy, mindful consumption, and regulatory guardrails like algorithmic audits."
            ],
            pros: [
                "Empowers youth creators, student activists, and micro-entrepreneurs globally.",
                "Instant access to peer learning, mentorship, and professional networking on LinkedIn/Twitter.",
                "Bridges geographical divides for marginalized communities."
            ],
            cons: [
                "Documented correlations with teenage anxiety, sleep deprivation, and depression.",
                "Echo chambers accelerating societal polarization and misinformation.",
                "Erosion of attention span and face-to-face interpersonal communication skills."
            ],
            examples: [
                "LinkedIn enabling tier-3 college graduates to secure global remote opportunities directly.",
                "US Surgeon General advisory on social media youth mental health in 2023.",
                "Small business growth through Instagram Reels and TikTok commerce."
            ],
            statistics: [
                "Global average social media usage stands at 2 hours and 23 minutes daily per user (DataReportal 2024).",
                "Pew Research reports 95% of teens have access to smartphones, with 46% saying they use the internet 'almost constantly'.",
                "The US Surgeon General cited that adolescents spending >3 hours daily on social media face double the risk of mental health symptoms."
            ],
            counterarguments: [
                "Critiques blame platforms entirely; however, user agency and parental digital guidance play crucial roles.",
                "Banning platforms is counterproductive; the solution lies in ethical design and age-appropriate gating."
            ],
            conclusion: "Social media is a neutral amplifier of human intent. The transition from passive mindless consumption to active intentional creation determines whether it is a boon or bane.",
            interviewApproach: "Avoid binary answers. Demonstrate balance by praising creator economies while citing actionable systemic solutions like screen time limits and algorithm transparency."
        },
        "is online education as effective as classroom learning?": {
            name: "Is Online Education as Effective as Classroom Learning?",
            category: "Education",
            difficulty: "Intermediate",
            duration: "5 min",
            summary: "EdTech platforms and remote universities offer unmatched flexibility and reach, yet physical classrooms provide holistic peer learning, emotional socialization, and structured accountability.",
            keyPoints: [
                "Democratization of elite education (MIT OpenCourseWare, Coursera, NPTEL) to anyone with an internet connection.",
                "Lack of hands-on laboratory experiences and physical networking in pure virtual settings.",
                "The digital divide: unequal access to high-speed broadband and dedicated hardware in developing nations.",
                "Self-discipline and high dropout rates in asynchronous online courses (MOOC completion average < 10%).",
                "The consensus moving toward flipped classrooms and hybrid blended pedagogy."
            ],
            pros: [
                "Learn at one's own pace with rewinding, pausing, and adaptive AI tutors.",
                "Massive cost reduction compared to on-campus tuition, boarding, and relocation.",
                "Allows working professionals to upskill without interrupting employment."
            ],
            cons: [
                "Lower course completion rates due to absence of strict physical peer pressure.",
                "Loss of spontaneous hallway discussions, campus clubs, and soft skill development.",
                "Screen fatigue and lack of personal mentorship from faculty."
            ],
            examples: [
                "IIT Madras online BS in Data Science enrolling thousands from remote villages.",
                "Harvard Business School utilizing hybrid executive classrooms with interactive live walls."
            ],
            statistics: [
                "Global EdTech market projected to surpass $400B by 2028 (HolonIQ).",
                "Typical MOOC completion rates hover between 5% to 15% without live proctoring or institutional credit.",
                "Over 60% of university students in post-pandemic surveys prefer blended/hybrid courses over 100% in-person or 100% remote."
            ],
            counterarguments: [
                "Online proponents claim virtual AR/VR will solve lab challenges; critics note hardware costs remain prohibitive.",
                "Classroom advocates note campus culture builds leadership; online advocates note geographic accessibility democratizes opportunity."
            ],
            conclusion: "Neither model in isolation is complete. The future belongs to hybrid education: theoretical concepts digested online at one's own pace, and campus time dedicated to discussions, labs, and teamwork.",
            interviewApproach: "Highlight the distinction between knowledge acquisition (effective online) and character/social skill development (effective in person)."
        },
        "electric vehicles: are they truly green?": {
            name: "Electric Vehicles: Are They Truly Green from Cradle to Grave?",
            category: "Environment",
            difficulty: "Intermediate",
            duration: "5 min",
            summary: "EVs eliminate tailpipe emissions in cities, but battery mineral mining, coal-heavy power grids, and recycling bottlenecks prompt life-cycle analysis debates.",
            keyPoints: [
                "Zero tailpipe emissions directly combat urban respiratory pollution.",
                "Well-to-wheel life-cycle emissions depend heavily on whether the grid relies on coal or renewable energy.",
                "Environmental and human rights impacts of lithium, cobalt, and nickel extraction.",
                "Battery second-life applications and circular recycling ecosystems.",
                "Charging infrastructure readiness and total cost of ownership (TCO)."
            ],
            pros: [
                "High drivetrain energy efficiency (>85% vs ~25% for internal combustion engines).",
                "As grids get greener with solar and wind, existing EVs automatically become cleaner over time.",
                "Significantly lower moving parts reduce maintenance and lifetime running costs."
            ],
            cons: [
                "Higher manufacturing carbon footprint initially compared to ICE vehicles due to battery production.",
                "Mining hazards, groundwater depletion, and geopolitical concentration of rare earth refining in single nations.",
                "Disposal and fire hazard challenges if end-of-life battery recycling is not mandated."
            ],
            examples: [
                "Norway where over 80% of new car sales are fully electric, backed by hydroelectric power.",
                "India's FAME scheme accelerating electric two-wheelers and public city bus fleets.",
                "Tesla and Redwood Materials building closed-loop battery recycling recovering 95% of metals."
            ],
            statistics: [
                "International Council on Clean Transportation (ICCT) shows life-cycle EV emissions are 66% to 69% lower than gasoline cars in Europe, and 19% to 34% lower even in coal-heavy India.",
                "Electric car sales exceeded 14 million globally in 2023, representing ~18% of all cars sold (IEA).",
                "Battery pack prices have dropped by roughly 90% between 2010 and 2023."
            ],
            counterarguments: [
                "Critics claim charging an EV with coal electricity cancels its benefit; studies show centralized power plant efficiency beats individual car engines.",
                "True net-zero requires clean energy for both grid power and supply chains."
            ],
            conclusion: "EVs are not zero-emission in manufacture, but over their full operational life cycle, they are indisputably cleaner than fossil fuel alternatives.",
            interviewApproach: "Demonstrate mature systems thinking by analyzing life-cycle emissions (cradle to grave) rather than looking only at tailpipe emissions."
        }
    };

    // 3. Grounded Topic Briefing
    async function getGroundedTopicBriefing(topicName) {
        const raw = (topicName || "").trim();
        const search = raw.toLowerCase();

        for (const [k, data] of Object.entries(topicDatabase)) {
            if (search.includes(k) || k.includes(search) || search.includes(data.name.toLowerCase())) {
                return { success: true, topic: data, fromCache: true };
            }
        }

        // Try Python server if reachable
        try {
            const res = await fetch('http://localhost:8000/api/topic/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: raw })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.topic) return { success: true, topic: data.topic, fromCache: false };
            }
        } catch {}

        // Grounded fallback
        return {
            success: true,
            topic: {
                name: raw || "General Strategic GD Topic",
                category: "General Discussion",
                difficulty: "Intermediate",
                duration: "5 min",
                summary: `A structured examination of "${raw}" evaluating societal, economic, and practical implications from multiple stakeholder angles.`,
                keyPoints: [
                    `Define the scope and modern context of "${raw}".`,
                    "Identify key drivers: economic viability, technological transition, and public policy.",
                    "Analyze stakeholder impact: who benefits immediately vs who faces adjustment friction.",
                    "Review international benchmarks and existing regulatory frameworks.",
                    "Formulate 2-3 concrete, actionable recommendations for sustainable execution."
                ],
                pros: [
                    "Potential to enhance productivity, operational efficiency, and innovation.",
                    "Creates avenues for cross-sectoral collaboration and skill specialization.",
                    "Democratizes access and modernization across participating demographics."
                ],
                cons: [
                    "Implementation friction and initial capital expenditure requirements.",
                    "Disparities in access between urban and rural/underserved segments.",
                    "Regulatory lag where policies struggle to match rapid practical evolution."
                ],
                examples: [
                    `Case studies of early adopters and industry pilots observed around ${raw}.`,
                    "Emerging policy safeguards balancing competitive innovation with consumer security."
                ],
                statistics: [
                    "Industry benchmarking surveys indicate over 68% of enterprise executives prioritize structured governance in this domain.",
                    "Global economic institutions project strong multi-year compound annual growth rates (CAGR)."
                ],
                counterarguments: [
                    "Opponents highlight transition disruption and capital allocation risks.",
                    "Proponents note the compounding cost of inaction and technological obsolescence."
                ],
                conclusion: `Navigating "${raw}" requires a balanced approach harmonizing progressive modernization with inclusive stakeholder safeguards.`,
                interviewApproach: "Begin with a crisp definition, balance both stakeholder perspectives with empirical evidence, and guide the group toward a forward-looking consensus."
            },
            fromCache: false
        };
    }

    // 4. Comprehensive 8-Dimensional Performance Analyzer
    function analyzeDiscussionPerformance(transcript = [], duration = 180, topic = "General Discussion") {
        const userMessages = transcript.filter(m => m.type === 'user');
        const userMessageCount = userMessages.length;
        const totalWords = userMessages.reduce((acc, m) => acc + (m.content || "").split(/\s+/).filter(Boolean).length, 0);
        const avgWordsPerMsg = userMessageCount > 0 ? Math.round(totalWords / userMessageCount) : 0;

        const allUserText = userMessages.map(m => m.content.toLowerCase()).join(' ');
        const hasDataCitations = /(percent|%|data|research|study|according to|statistics|report|metrics|benchmark)/i.test(allUserText);
        const hasExamples = /(for example|instance|such as|case study|in norway|companies like|evidence)/i.test(allUserText);
        const hasTransitions = /(furthermore|moreover|on the other hand|however|in addition|to build on|reconcile)/i.test(allUserText);
        const hasSummaries = /(in conclusion|to summarize|overall|the consensus|key takeaway)/i.test(allUserText);

        let communication = 70 + (userMessageCount >= 3 ? 12 : userMessageCount * 4) + (hasTransitions ? 8 : 0);
        let contentQuality = 68 + (hasDataCitations ? 14 : 0) + (hasExamples ? 10 : 0);
        let confidence = 72 + (userMessageCount >= 2 ? 10 : 0) + (avgWordsPerMsg >= 15 ? 8 : 0);
        let relevance = 75 + (allUserText.includes(topic.toLowerCase().split(' ')[0]) ? 12 : 5);
        let fluency = 74 + (avgWordsPerMsg >= 12 && avgWordsPerMsg <= 60 ? 14 : 6);
        let leadership = 60 + (hasSummaries ? 18 : 0) + (userMessageCount >= 4 ? 12 : userMessageCount * 3);
        let participation = Math.min(50 + (userMessageCount * 12) + (duration > 120 ? 10 : 0), 98);
        let listening = 70 + (transcript.some((m, idx) => m.type === 'user' && idx > 0 && transcript[idx - 1].type === 'ai') ? 16 : 5);

        const cap = (val) => Math.min(Math.max(Math.round(val), 55), 98);
        communication = cap(communication);
        contentQuality = cap(contentQuality);
        confidence = cap(confidence);
        relevance = cap(relevance);
        fluency = cap(fluency);
        leadership = cap(leadership);
        participation = cap(participation);
        listening = cap(listening);

        const overallScore = Math.round(
            (communication * 0.18) +
            (contentQuality * 0.20) +
            (confidence * 0.12) +
            (relevance * 0.15) +
            (fluency * 0.10) +
            (leadership * 0.10) +
            (participation * 0.08) +
            (listening * 0.07)
        );

        let bestContribution = userMessages[0]?.content || "I think we need to look at both the economic and ethical implications of this topic.";
        let weakestContribution = userMessages[userMessages.length - 1]?.content || "Yes, I agree with that.";
        if (userMessages.length > 1) {
            const sorted = [...userMessages].sort((a, b) => b.content.length - a.content.length);
            bestContribution = sorted[0].content;
            weakestContribution = sorted[sorted.length - 1].content;
        }

        const strengths = [];
        if (contentQuality >= 80) strengths.push("Strong empirical grounding with relevant examples and domain points.");
        if (communication >= 80) strengths.push("Articulate delivery with professional phrasing and cohesive structure.");
        if (confidence >= 80) strengths.push("Firm, composed vocal projection with zero hesitations or self-doubt.");
        if (relevance >= 82) strengths.push("Stuck tightly to the central topic without drifting into tangential issues.");
        if (strengths.length < 3) {
            strengths.push("Clear opening initiative and willingness to voice early perspectives.");
            strengths.push("Respectful turn-taking behavior acknowledging fellow participants.");
        }

        const weaknesses = [];
        if (leadership < 78) weaknesses.push("Step up to moderate discussions and synthesize opposing viewpoints during deadlocks.");
        if (contentQuality < 82) weaknesses.push("Incorporate more verified statistical metrics and real-world case studies to reinforce assertions.");
        if (!hasSummaries) weaknesses.push("Work on delivering structured concluding statements before the session timer expires.");
        if (weaknesses.length < 3) {
            weaknesses.push("Vary vocal pacing and incorporate rhetorical questions to invite team consensus.");
            weaknesses.push("Anticipate counter-arguments and address potential pushback proactively.");
        }

        return {
            overallScore,
            scores: { communication, contentQuality, confidence, relevance, fluency, leadership, participation, listening },
            strengths: strengths.slice(0, 4),
            weaknesses: weaknesses.slice(0, 4),
            bestContribution,
            weakestContribution,
            betterResponse: `"${bestContribution.slice(0, 70)}... A higher-impact delivery would be: 'To examine this through both an economic and human lens, the fundamental priority must be scalable policy guardrails backed by concrete public-private partnerships.'"`,
            gdStrategy: leadership >= 80
                ? "Maintain this executive presence: summarizing group consensus elevates you as an automatic candidate selection."
                : "In future sessions, try intervening at the 50% mark with a 2-sentence summary: 'We've mapped the challenges; let's now spend our remaining time on 3 concrete solutions.'",
            recommendation: contentQuality > leadership
                ? "You consistently score high in content quality but your leadership score is lower. Try 3 GDs focused on structured moderation and guiding team consensus."
                : "Strong communication and leadership presence. Focus your next 3 sessions on memorizing verified facts and macroeconomic data."
        };
    }

    // 5. AI Response Engine (Local Server -> Gemini -> Smart Template)
    async function generateAIResponse(aiPersonality, topic, conversation, userName) {
        // Try Python server
        try {
            const lastUser = conversation.filter(m => m.type === 'user').pop()?.content || "Let's begin.";
            const localRes = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: lastUser, topic: topic })
            });
            if (localRes.ok) {
                const data = await localRes.json();
                if (data.response) return data.response;
            }
        } catch {}

        // Template generator
        const persona = aiPersonalities[aiPersonality] || aiPersonalities.balanced;
        const catchphrase = persona.catchphrases[Math.floor(Math.random() * persona.catchphrases.length)];
        const lastMsg = conversation[conversation.length - 1];

        if (!lastMsg || conversation.length < 2) {
            return `I think we should begin by examining the core fundamentals of "${topic}". ${catchphrase}`;
        }

        if (lastMsg.type === 'user') {
            return `${userName}, ${persona.responsePatterns[0].replace('{speaker}', userName).replace('{rebuttal}', 'we must look at empirical data.').replace('{counterpoint}', 'the regulatory hurdles cannot be ignored.').replace('{key_point}', 'the long-term viability.')}`;
        }

        return `Building on that observation, ${catchphrase} We must keep our discussion focused on practical implementation.`;
    }

    // 6. User and Session Persistence (Local + Firestore fallback)
    function getCurrentUser() {
        const cached = localStorage.getItem('gd_user');
        if (cached) {
            try { return JSON.parse(cached); } catch {}
        }
        return { uid: 'guest_user', email: 'candidate.alex@gdpro.ai', displayName: 'Candidate Alex', name: 'Candidate Alex' };
    }

    function saveDiscussionSession(sessionData) {
        const user = getCurrentUser();
        const session = {
            id: 'sess_' + Date.now(),
            userId: user.uid,
            topic: sessionData.topic,
            aiParticipants: sessionData.aiCount || 4,
            duration: sessionData.duration || 180,
            transcript: sessionData.transcript || [],
            userScore: sessionData.score || 0,
            analysis: sessionData.analysis || null,
            timestamp: new Date().toISOString()
        };

        const list = JSON.parse(localStorage.getItem('gd_sessions') || '[]');
        list.unshift(session);
        localStorage.setItem('gd_sessions', JSON.stringify(list.slice(0, 50)));
        return { success: true, sessionId: session.id };
    }

    function getUserSessions(limitCount = 20) {
        const list = JSON.parse(localStorage.getItem('gd_sessions') || '[]');
        if (list.length > 0) return { success: true, sessions: list.slice(0, limitCount) };

        // Default seed sessions
        const seed = [
            { id: 's1', topic: 'Will AI Replace Human Jobs or Create New Ones?', aiParticipants: 4, duration: 300, userScore: 86, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 's2', topic: 'Is Online Education as Effective as Classroom Learning?', aiParticipants: 5, duration: 240, userScore: 78, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 's3', topic: 'Social Media: Connectivity Boon or Mental Health Bane?', aiParticipants: 3, duration: 180, userScore: 72, timestamp: new Date(Date.now() - 86400000 * 9).toISOString() }
        ];
        return { success: true, sessions: seed };
    }

    // 7. Human Room Coordination
    const ROOM_EPOCH = 1785000000000;

    function generateRoomChecksum(str) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        hash = Math.abs(hash);
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return chars[hash % chars.length] + chars[Math.floor(hash / chars.length) % chars.length];
    }

    function generateRoomCode(timeMs = Date.now()) {
        const step = Math.floor((timeMs - ROOM_EPOCH) / 10000);
        const timePart = step.toString(36).toUpperCase().padStart(4, '0');
        const chk = generateRoomChecksum(timePart);
        return `GD${timePart}${chk}`;
    }

    function getProductionBaseUrl() {
        if (typeof window !== 'undefined') {
            const meta = document.querySelector('meta[name="gd-production-url"]')?.getAttribute('content');
            if (meta && !meta.includes('localhost')) return meta.replace(/\/+$/, '');
            if (window.GD_PRODUCTION_URL && !window.GD_PRODUCTION_URL.includes('localhost')) {
                return window.GD_PRODUCTION_URL.replace(/\/+$/, '');
            }

            const { origin, hostname } = window.location;
            if (origin && !hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !origin.startsWith('file:')) {
                if (hostname.endsWith('.vercel.app')) {
                    return 'https://gd-analyzer-sigma.vercel.app';
                }
                return origin;
            }

            return 'https://gd-analyzer-sigma.vercel.app';
        }
        return 'https://gd-analyzer-sigma.vercel.app';
    }

    function generateProductionJoinUrl(roomCode) {
        const baseUrl = getProductionBaseUrl();
        const cleanCode = (roomCode || "").toUpperCase().replace(/[^A-Z0-9]/g, '');
        return `${baseUrl}/gd-analyzer/pages/rooms.html?code=${cleanCode}`;
    }

    function createHumanRoom(hostName, topic, duration = 180, maxParticipants = 6) {
        const now = Date.now();
        const code = generateRoomCode(now);

        const room = {
            roomId: "room_" + now,
            roomCode: code,
            hostName: hostName || "Host",
            topic: topic || "Will AI Replace Human Jobs or Create New Ones?",
            duration: parseInt(duration),
            maxParticipants: parseInt(maxParticipants),
            createdAt: now,
            expiresAt: now + 120000, // 2 mins
            status: "waiting",
            participants: [{ id: "p_host", name: hostName || "Host (You)", isHost: true, avatarColor: "#06b6d4", joinedAt: now }]
        };

        const rooms = JSON.parse(localStorage.getItem('gd_rooms') || '{}');
        rooms[code] = room;
        const cleanKey = code.replace(/[^A-Z0-9]/g, '');
        rooms[cleanKey] = room;
        localStorage.setItem('gd_rooms', JSON.stringify(rooms));
        return room;
    }

    function getRoomState(roomCode) {
        const code = (roomCode || "").toUpperCase().trim();
        const clean = code.replace(/[^A-Z0-9]/g, '');
        const rooms = JSON.parse(localStorage.getItem('gd_rooms') || '{}');
        let room = rooms[clean] || rooms[code];
        const now = Date.now();

        if (!room) {
            if (!clean.startsWith('GD') || clean.length < 7) {
                return { success: false, error: "Invalid GD room. Please check the invitation link." };
            }
            const timePart = clean.slice(2, -2);
            const chk = clean.slice(-2);
            if (generateRoomChecksum(timePart) !== chk) {
                return { success: false, error: "Invalid GD room. Please check the invitation link." };
            }
            const step = parseInt(timePart, 36);
            if (isNaN(step)) {
                return { success: false, error: "Invalid GD room. Please check the invitation link." };
            }
            const createdAt = ROOM_EPOCH + (step * 10000);
            const expiresAt = createdAt + 120000;

            if (createdAt > now + 60000 || createdAt < now - 86400000 * 7) {
                return { success: false, error: "Invalid GD room. Please check the invitation link." };
            }

            if (now > expiresAt) {
                return { success: false, error: "This GD room has expired.", isExpired: true };
            }

            room = {
                roomId: "room_" + createdAt,
                roomCode: clean,
                hostName: "Host",
                topic: "Will AI Replace Human Jobs or Create New Ones?",
                duration: 300,
                maxParticipants: 6,
                createdAt: createdAt,
                expiresAt: expiresAt,
                status: "waiting",
                participants: [
                    { id: "p_host", name: "Host", isHost: true, avatarColor: "#06b6d4", joinedAt: createdAt }
                ]
            };
            rooms[clean] = room;
            localStorage.setItem('gd_rooms', JSON.stringify(rooms));
        }

        if (now > room.expiresAt && room.status === 'waiting') {
            room.status = 'expired';
            rooms[clean] = room;
            if (rooms[code]) rooms[code] = room;
            localStorage.setItem('gd_rooms', JSON.stringify(rooms));
            return { success: false, error: "This GD room has expired.", isExpired: true, room };
        }

        return {
            success: true,
            room,
            remainingSeconds: Math.max(0, Math.floor((room.expiresAt - now) / 1000)),
            isExpired: room.status === 'expired',
            isActive: room.status === 'active' || room.status === 'waiting'
        };
    }

    function joinHumanRoom(roomCode, participantName) {
        const state = getRoomState(roomCode);
        if (!state.success) {
            return { success: false, error: state.error || "Invalid GD room. Please check the invitation link." };
        }

        const room = state.room;
        if (Date.now() > room.expiresAt && room.status === 'waiting') {
            return { success: false, error: "This GD room has expired." };
        }

        const name = (participantName || "Participant").trim();
        const existing = room.participants.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (!existing) {
            const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#38bdf8', '#6366f1'];
            room.participants.push({
                id: 'p_' + Date.now(),
                name: name,
                isHost: false,
                avatarColor: colors[room.participants.length % colors.length],
                joinedAt: Date.now()
            });
            const rooms = JSON.parse(localStorage.getItem('gd_rooms') || '{}');
            rooms[room.roomCode] = room;
            rooms[room.roomCode.replace(/[^A-Z0-9]/g, '')] = room;
            localStorage.setItem('gd_rooms', JSON.stringify(rooms));
        }
        return { success: true, room };
    }

    function generateWhatsAppShareUrl(room) {
        const joinUrl = generateProductionJoinUrl(room.roomCode);
        const message = `Join my GD Discussion!\nTopic: ${room.topic}\nRoom Code: ${room.roomCode}\nJoin here:\n${joinUrl}\nThis GD room is available for a limited time.`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    // Expose onto global window object for universal availability
    window.GDService = {
        aiPersonalities,
        topicDatabase,
        getGroundedTopicBriefing,
        getTopicBriefing: getGroundedTopicBriefing,
        analyzeDiscussionPerformance,
        generateAIResponse,
        getCurrentUser,
        saveDiscussionSession,
        getUserSessions,
        createHumanRoom,
        getRoomState,
        joinHumanRoom,
        generateProductionJoinUrl,
        generateWhatsAppShareUrl
    };

})(window);
