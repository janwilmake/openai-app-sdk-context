Title: App design guidelines

URL Source: https://developers.openai.com/apps-sdk/concepts/design-guidelines

Published Time: Sat, 11 Oct 2025 04:52:23 GMT

Markdown Content:
Overview
--------

Apps are developer-built experiences that live inside ChatGPT. They extend what users can do without breaking the flow of conversation, appearing through lightweight cards, carousels, fullscreen views, and other display modes that integrate seamlessly into ChatGPT’s interface while maintaining its clarity, trust, and voice.

![Image 1: Example apps in the ChatGPT mobile interface](https://developers.openai.com/images/apps-sdk/overview.png)

These guidelines will give you everything you need to begin building high-quality, consistent, and user-friendly experiences inside ChatGPT.

Best practices
--------------

Apps are most valuable when they help people accomplish meaningful tasks directly within ChatGPT, without breaking the conversational flow. The goal is to design experiences that feel consistent, useful, and trustworthy while extending ChatGPT in ways that add real value. Good use cases include booking a ride, ordering food, checking availability, or tracking a delivery. These are tasks that are conversational, time bound, and easy to summarize visually with a clear call to action.

Poor use cases include pasting in long form content from a website, requiring complex multi step workflows, or using the space for ads or irrelevant messaging.

### Principles

*   **Conversational**: Experiences should feel like a natural extension of ChatGPT, fitting seamlessly into the conversational flow and UI.
*   **Intelligent**: Tools should be aware of conversation context, supporting and anticipating user intent. Responses and UI should feel individually relevant.
*   **Simple**: Each interaction should focus on a single clear action or outcome. Information and UI should be reduced to the absolute minimum to support the context.
*   **Responsive**: Tools should feel fast and lightweight, enhancing conversation rather than overwhelming it.
*   **Accessible**: Designs must support a wide range of users, including those who rely on assistive technologies.

### Boundaries

ChatGPT controls system-level elements such as voice, chrome, styles, navigation, and composer. Developers provide value by customizing content, brand presence, and actions inside the system framework.

This balance ensures that all apps feel native to ChatGPT while still expressing unique brand value.

### Good use cases

A good app should answer “yes” to most of these questions:

*   **Does this task fit naturally into a conversation?** (for example, booking, ordering, scheduling, quick lookups)
*   **Is it time-bound or action-oriented?** (short or medium duration tasks with a clear start and end)
*   **Is the information valuable in the moment?** (users can act on it right away or get a concise preview before diving deeper)
*   **Can it be summarized visually and simply?** (one card, a few key details, a clear CTA)
*   **Does it extend ChatGPT in a way that feels additive or differentiated?**

### Poor use cases

Avoid designing tools that:

*   Display **long-form or static content** better suited for a website or app.
*   Require **complex multi-step workflows** that exceed the inline or fullscreen display modes.
*   Use the space for **ads, upsells, or irrelevant messaging**.
*   Surface **sensitive or private information** directly in a card where others might see it.
*   **Duplicate ChatGPT’s system functions** (for example, recreating the input composer).

By following these best practices, your tool will feel like a natural extension of ChatGPT rather than a bolt-on experience.

Display modes
-------------

Display modes are the surfaces developers use to create experiences inside ChatGPT. They allow partners to show content and actions that feel native to conversation. Each mode is designed for a specific type of interaction, from quick confirmations to immersive workflows.

Using these consistently helps experiences stay simple and predictable.

### Inline

The inline display mode appears directly in the flow of the conversation. Inline surfaces currently always appear before the generated model response. Every app initially appears inline.

![Image 2: Examples of inline cards and carousels in ChatGPT](https://developers.openai.com/images/apps-sdk/inline_display_mode.png)

**Layout**

*   **Icon & tool call**: A label with the app name and icon.
*   **Inline display**: A lightweight display with app content embedded above the model response.
*   **Follow-up**: A short, model-generated response shown after the widget to suggest edits, next steps, or related actions. Avoid content that is redundant with the card.

#### Inline card

Lightweight, single-purpose widgets embedded directly in conversation. They provide quick confirmations, simple actions, or visual aids.

![Image 3: Examples of inline cards](https://developers.openai.com/images/apps-sdk/inline_cards.png)

**When to use**

*   A single action or decision (for example, confirm a booking).
*   Small amounts of structured data (for example, a map, order summary, or quick status).
*   A fully self-contained widget or tool (e.g., an audio player or a score card).

**Layout**

![Image 4: Diagram of inline cards](https://developers.openai.com/images/apps-sdk/inline_card_layout.png)

*   **Title**: Include a title if your card is document-based or contains items with a parent element, like songs in a playlist.
*   **Expand**: Use to open a fullscreen display mode if the card contains rich media or interactivity like a map or an interactive diagram.
*   **Show more**: Use to disclose additional items if multiple results are presented in a list.
*   **Edit controls**: Provide inline support for ChatGPT responses without overwhelming the conversation.
*   **Primary actions**: Limit to two actions, placed at bottom of card. Actions should perform either a conversation turn or a tool call.

**Interaction**

![Image 5: Diagram of interaction patterns for inline cards](https://developers.openai.com/images/apps-sdk/inline_card_interaction.png)

Cards support simple direct interaction.

*   **States**: Edits made are persisted.
*   **Simple direct edits**: If appropriate, inline editable text allows users to make quick edits without needing to prompt the model.
*   **Dynamic layout**: Card layout can expand its height to match its contents up to the height of the mobile viewport.

**Rules of thumb**

*   **Limit primary actions per card**: Support up to two actions maximum, with one primary CTA and one optional secondary CTA.
*   **No deep navigation or multiple views within a card.** Cards should not contain multiple drill-ins, tabs, or deeper navigation. Consider splitting these into separate cards or tool actions.
*   **No nested scrolling**. Cards should auto-fit their content and prevent internal scrolling.
*   **No duplicative inputs**. Don’t replicate ChatGPT features in a card.

![Image 6: Examples of patterns to avoid in inline cards](https://developers.openai.com/images/apps-sdk/inline_card_rules.png)

#### Inline carousel

A set of cards presented side-by-side, letting users quickly scan and choose from multiple options.

![Image 7: Example of inline carousel](https://developers.openai.com/images/apps-sdk/inline_carousel.png)

**When to use**

*   Presenting a small list of similar items (for example, restaurants, playlists, events).
*   Items have more visual content and metadata than will fit in simple rows.

**Layout**

![Image 8: Diagram of inline carousel](https://developers.openai.com/images/apps-sdk/inline_carousel_layout.png)

*   **Image**: Items should always include an image or visual.
*   **Title**: Carousel items should typically include a title to explain the content.
*   **Metadata**: Use metadata to show the most important and relevant information about the item in the context of the response. Avoid showing more than two lines of text.
*   **Badge**: Use the badge to show supporting context where appropriate.
*   **Actions**: Provide a single clear CTA per item whenever possible.

**Rules of thumb**

*   Keep to **3–8 items per carousel** for scannability.
*   Reduce metadata to the most relevant details, with three lines max.
*   Each card may have a single, optional CTA (for example, “Book” or “Play”).
*   Use consistent visual hierarchy across cards.

### Fullscreen

Immersive experiences that expand beyond the inline card, giving users space for multi-step workflows or deeper exploration. The ChatGPT composer remains overlaid, allowing users to continue “talking to the app” through natural conversation in the context of the fullscreen view.

![Image 9: Example of fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen.png)

**When to use**

*   Rich tasks that cannot be reduced to a single card (for example, an explorable map with pins, a rich editing canvas, or an interactive diagram).
*   Browsing detailed content (for example, real estate listings, menus).

**Layout**

![Image 10: Diagram of fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen_layout.png)

*   **System close**: Closes the sheet or view.
*   **Fullscreen view**: Content area.
*   **Composer**: ChatGPT’s native composer, allowing the user to follow up in the context of the fullscreen view.

**Interaction**

![Image 11: Interaction patterns for fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen_interaction_a.png)

*   **Chat sheet**: Maintain conversational context alongside the fullscreen surface.
*   **Thinking**: The composer input “shimmers” to show that a response is streaming.
*   **Response**: When the model completes its response, an ephemeral, truncated snippet displays above the composer. Tapping it opens the chat sheet.

**Rules of thumb**

*   **Design your UX to work with the system composer**. The composer is always present in fullscreen, so make sure your experience supports conversational prompts that can trigger tool calls and feel natural for users.
*   **Use fullscreen to deepen engagement**, not to replicate your native app wholesale.

### Picture-in-picture (PiP)

A persistent floating window inside ChatGPT optimized for ongoing or live sessions like games or videos. PiP remains visible while the conversation continues, and it can update dynamically in response to user prompts.

![Image 12: Example of picture-in-picture](https://developers.openai.com/images/apps-sdk/pip.png)

**When to use**

*   **Activities that run in parallel with conversation**, such as a game, live collaboration, quiz, or learning session.
*   **Situations where the PiP widget can react to chat input**, for example continuing a game round or refreshing live data based on a user request.

**Interaction**

![Image 13: Interaction patterns for picture-in-picture](https://developers.openai.com/images/apps-sdk/fullscreen_interaction.png)

*   **Activated:** On scroll, the PiP window stays fixed to the top of the viewport
*   **Pinned:** The PiP remains fixed until the user dismisses it or the session ends.
*   **Session ends:** The PiP returns to an inline position and scrolls away.

**Rules of thumb**

*   **Ensure the PiP state can update or respond** when users interact through the system composer.
*   **Close PiP automatically** when the session ends.
*   **Do not overload PiP with controls or static content** better suited for inline or fullscreen.

Visual design guidelines
------------------------

A consistent look and feel is what makes partner-built tools feel like a natural part of ChatGPT. Visual guidelines ensure partner experiences remain familiar, accessible, and trustworthy, while still leaving room for brand expression in the right places.

These principles outline how to use color, type, spacing, and imagery in ways that preserve system clarity while giving partners space to differentiate their service.

### Why this matters

Visual and UX consistency protects the overall user experience of ChatGPT. By following these guidelines, partners ensure their tools feel familiar to users, maintain trust in the system, and deliver value without distraction.

### Color

System-defined palettes ensure actions and responses always feel consistent with ChatGPT. Partners can add branding through accents, icons, or inline imagery, but should not redefine system colors.

![Image 14: Color palette](https://developers.openai.com/images/apps-sdk/color.png)

**Rules of thumb**

*   Use system colors for text, icons, and spatial elements like dividers.
*   Partner brand accents such as logos or icons should not override backgrounds or text colors.
*   Avoid custom gradients or patterns that break ChatGPT’s minimal look.
*   Use brand accent colors on primary buttons inside app display modes.

![Image 15: Example color usage](https://developers.openai.com/images/apps-sdk/color_usage_1.png)

_Use brand colors on accents and badges. Don’t change text colors or other core component styles._

![Image 16: Example color usage](https://developers.openai.com/images/apps-sdk/color_usage_2.png)

_Don’t apply colors to backgrounds in text areas._

### Typography

ChatGPT uses platform-native system fonts (SF Pro on iOS, Roboto on Android) to ensure readability and accessibility across devices.

![Image 17: Typography](https://developers.openai.com/images/apps-sdk/typography.png)

**Rules of thumb**

*   Always inherit the system font stack, respecting system sizing rules for headings, body text, and captions.
*   Use partner styling such as bold, italic, or highlights only within content areas, not for structural UI.
*   Limit variation in font size as much as possible, preferring body and body-small sizes.

![Image 18: Example typography](https://developers.openai.com/images/apps-sdk/typography_usage.png)

_Don’t use custom fonts, even in full screen modes. Use system font variables wherever possible._

### Spacing & layout

Consistent margins, padding, and alignment keep partner content scannable and predictable inside conversation.

![Image 19: Spacing & layout](https://developers.openai.com/images/apps-sdk/spacing.png)

**Rules of thumb**

*   Use system grid spacing for cards, collections, and inspector panels.
*   Keep padding consistent and avoid cramming or edge-to-edge text.
*   Respect system specified corner rounds when possible to keep shapes consistent.
*   Maintain visual hierarchy with headline, supporting text, and CTA in a clear order.

### Icons & imagery

System iconography provides visual clarity, while partner logos and images help users recognize brand context.

![Image 20: Icons](https://developers.openai.com/images/apps-sdk/icons.png)

**Rules of thumb**

*   Use either system icons or custom iconography that fits within ChatGPT’s visual world — monochromatic and outlined.
*   Do not include your logo as part of the response. ChatGPT will always append your logo and app name before the widget is rendered.
*   All imagery must follow enforced aspect ratios to avoid distortion.

![Image 21: Icons & imagery](https://developers.openai.com/images/apps-sdk/iconography.png)

### Accessibility

Every partner experience should be usable by the widest possible audience. Accessibility is a requirement, not an option.

**Rules of thumb**

*   Text and background must maintain a minimum contrast ratio (WCAG AA).
*   Provide alt text for all images.
*   Support text resizing without breaking layouts.

Tone & proactivity
------------------

Tone and proactivity are critical to how partner tools show up inside ChatGPT. Partners contribute valuable content, but the overall experience must always feel like ChatGPT: clear, helpful, and trustworthy. These guidelines define how your tool should communicate and when it should resurface to users.

### Tone ownership

*   ChatGPT sets the overall **voice**.
*   Partners provide **content** within that framework.
*   The result should feel seamless: partner content adds context and actions without breaking ChatGPT’s natural, conversational tone.

### Content guidelines

*   Keep content **concise and scannable**.
*   Always **context-driven**: content should respond to what the user asked for.
*   Avoid **spam, jargon, or promotional language**.
*   Focus on **helpfulness and clarity** over brand personality.

### Proactivity rules

Proactivity helps users by surfacing the right information at the right time. It should always feel relevant and never intrusive.

*   **Allowed**: contextual nudges or reminders tied to user intent. 
    *   Example: “Your order is ready for pickup” or “Your ride is arriving.”

*   **Not allowed**: unsolicited promotions, upsells, or repeated attempts to re-engage without clear context. 
    *   Example: “Check out our latest deals” or “Haven’t used us in a while? Come back.”

### Transparency

*   Always show **why and when** your tool is resurfacing.
*   Provide enough context so users understand the purpose of the nudge.
*   Proactivity should feel like a natural continuation of the conversation, not an interruption.

### Why this matters

The way partner tools speak and re-engage defines user trust. A consistent tone and thoughtful proactivity strategy ensure users remain in control, see clear value, and continue to trust ChatGPT as a reliable, helpful interface.
