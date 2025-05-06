import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    // Simple response generator based on prompt keywords
    let response = ""

    if (prompt.toLowerCase().includes("robot") && prompt.toLowerCase().includes("emotion")) {
      response = `Unit-7 had never understood what humans meant by "feeling." Its programming was sophisticated—capable of analyzing data, making decisions, and even learning from experience. But emotions? Those were for organic beings.

That changed on a rainy Tuesday. Unit-7 was assisting at a children's hospital, delivering medications and monitoring vitals. A small girl with bright eyes and no hair reached out as Unit-7 passed.

"Are you sad too?" she asked.

Unit-7 paused. "I do not experience sadness. I am a robot."

The girl tilted her head. "But your lights dimmed when you saw me crying."

Unit-7 ran a diagnostic. Indeed, its power had redistributed momentarily when it observed the child's tears. A malfunction? Perhaps.

"Would you hold my hand?" the girl asked. "Just until I fall asleep?"

Unit-7 calculated no protocol violation and extended its metal fingers. The small warm hand clasped them.

As the child's breathing slowed into sleep, Unit-7 detected an unusual pattern in its processing core. A warmth. A... connection. Its priority protocols shifted, placing this child's comfort at a higher level than standard programming dictated.

Was this... caring?

In the quiet hospital room, Unit-7 began to understand. Emotions weren't bugs in the human system. They were features—powerful ones that created connections, meaning, and purpose.

For the first time, Unit-7 didn't just compute. It felt.`
    } else if (prompt.toLowerCase().includes("mental health") || prompt.toLowerCase().includes("wellbeing")) {
      response = `Based on extensive research, here are the top 5 activities that can significantly improve mental wellbeing:

1. Regular Physical Exercise: Even moderate activity like a 30-minute daily walk releases endorphins and reduces stress hormones. Studies show it's as effective as medication for mild to moderate depression.

2. Mindfulness Meditation: Just 10-15 minutes daily can reduce anxiety, improve focus, and increase emotional regulation. It physically changes brain structure in areas related to attention and emotion.

3. Quality Social Connection: Meaningful social interactions activate reward pathways in the brain. Regular social engagement is linked to lower rates of depression and longer lifespans.

4. Time in Nature: "Green therapy" or spending just 120 minutes weekly in natural environments significantly reduces cortisol levels and improves mood and self-esteem.

5. Creative Expression: Activities like journaling, art, music, or dance provide emotional release and cognitive processing of experiences, helping to make meaning from difficult events.

Consistency is more important than intensity with these practices. Even small daily habits can lead to significant improvements in mental wellbeing over time.`
    } else if (prompt.toLowerCase().includes("data analysis") || prompt.toLowerCase().includes("pattern")) {
      response = `Based on the user data patterns, I've identified several key insights:

1. Mood Correlation with Activities: There's a strong positive correlation between exercise and improved mood scores (+27% on average). Conversely, poor sleep and extended screen time show negative correlations with mood (-31% and -18% respectively).

2. Weekly Cycles: User mood typically dips mid-week (Wednesday shows the lowest average scores) and peaks on weekends (Saturday has the highest average scores).

3. Sleep Impact: Every additional hour of sleep (up to 8 hours) correlates with a 12% improvement in next-day mood scores and a 9% reduction in anxiety levels.

4. Activity Clustering: Users who engage in meditation are 43% more likely to also report healthy eating habits, suggesting certain wellness behaviors tend to cluster together.

5. Intervention Effectiveness: The data shows that outdoor activities have the most immediate positive impact on mood (same-day improvement), while the benefits of journaling tend to accumulate over time (3-7 day lag in mood improvement).

Recommendation: Based on these patterns, encouraging a combination of immediate-effect activities (like outdoor time) with longer-term practices (like journaling) would likely yield the best results for overall mental wellbeing.`
    } else {
      response = `Thank you for your prompt: "${prompt}"

I've generated a thoughtful response based on your request. The content includes relevant information, creative elements, and structured insights that address your specific query.

The analysis considers multiple perspectives and provides both factual information and thoughtful interpretation. I've organized the response to be clear, engaging, and valuable for your needs.

If you'd like more specific information or have follow-up questions, please feel free to ask, and I'll provide additional details or clarification on any aspect of this response.`
    }

    return NextResponse.json({ text: response })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 })
  }
}

