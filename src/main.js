const {HtmlTelegramBot, userInfoToString} = require("./bot");
const ChatGptService = require("./gpt");

class MyTelegramBot extends HtmlTelegramBot {
    constructor(token) {
        super(token);
        this.mode = null;
        this.list= [];
        this.user = {};
    }

    async start(msg){
        this.mode = "main"
        const text = this.loadMessage("main")
        await this.sendImage("main")
        await this.sendText(text)

        await this.showMainMenu({
            "start": "главное меню бота",
            "profile": "генерация Tinder-профиля 😎",
            "opener": "сообщение для знакомства 🥰",
            "message": "переписка от вашего имени 😈",
            "date": "переписка со звездами 🔥",
            "gpt": "задать вопрос чату GPT 🧠",
            "html": "демонстрация HTML"
        })
    }

    async html(msg){
        const text = this.loadMessage("main")
        await this.sendHTML('<h3 style="color:#1558b0">Привет!</h3>')
        const html = this.loadHtml("main")
        await this.sendHTML(html, {theme: "dark"})
    }

    async gpt(msg){
        this.mode = "gpt"
        const text = this.loadMessage("gpt")
        await this.sendImage("gpt")
        await this.sendText(text)
    }

    async gptDialog(msg){
        const text = msg.text;
        const myMessage = await this.sendText("Ваше сообщение было переслано ChatGPT. Ожидайте...")
        const answer = await chatgpt.sendQuestion("Ответь на вопрос", text)
        await this.editText(myMessage, answer)
    }

    async date(msg){
        this.mode = "date"
        const text = this.loadMessage("date")
        await this.sendImage("date")
        await this.sendTextButtons(text, {
            "date_grande":"Ариана Гранде",
            "date_robbie":"Марго Робби",
            "date_zendaya":"Зендея",
            "date_gosling":"Райан Гослинг",
            "date_hardy":"Том Харди"
        })

    }

    async dateButton(callbackQuery){
        const query = callbackQuery.data;
        await this.sendImage(query)
        await this.sendImage("Отличный выбор! Пригласи девушку/парня на свидание за 5 сообщений:")
        const prompt = this.loadPrompt(query)
        chatgpt.setPrompt(prompt)
    }

    async dateDialog(msg){
        const text = msg.text
        const myMessage = await this.sendText("Девушка набирает текст...")
        const answer = await chatgpt.addMessage(text)
        await this.editText(myMessage, answer)
    }

    async message(msg){
        this.mode = "message"
        const text = this.loadMessage("message")
        await this.sendImage("message")
        await this.sendTextButtons(text, {
            "message_next":"Следующее сообщение",
            "message_date":"Пригласить на свидание"
        })
        this.list = []
    }

    async messageButton(callbackQuery){
        const query = callbackQuery.data;
        const prompt = this.loadPrompt(query)
        const userChatHistory = this.list.join("\n\n");

        const myMessage = await this.sendText("ChatGPT думает над вариантами ответа...")
        const answer = await chatgpt.sendQuestion(prompt, userChatHistory)
        await this.editText(myMessage, answer)
    }

    async messageDialog(msg){
        const text = msg.text
        this.list.push(text)
    }

    async profile(msg){
        this.mode = "profile"
        const text = this.loadMessage("profile")
        await this.sendImage("profile")
        await this.sendText(text)

        this.user = {}
        this.count = 0
        await this.sendText("Сколько Вам лет?")
    }

    async profileDialog(msg){
        const text = msg.text
        this.count++;

        if (this.count === 1){
            this.user["age"] = text;
            await this.sendText("Кем Вы работаете?")
        }
        if (this.count === 2){
            this.user["occupation"] = text;
            await this.sendText("У Вас есть хобби?")
        }
        if (this.count === 3){
            this.user["hobby"] = text;
            await this.sendText("Что Вам НЕ нравится в людях?")
        }
        if (this.count === 4){
            this.user["annoys"] = text;
            await this.sendText("Цели знакомства?")
        }
        if (this.count === 5){
            this.user["goals"] = text;

            const prompt = this.loadPrompt("profile")
            const info = userInfoToString(this.user)
            const myMessage = await this.sendText("ChatGPT генерирует Ваш профиль...")
            const answer = await chatgpt.sendQuestion(prompt, info)
            await this.editText(myMessage, answer)
        }
    }

    async opener(msg){
        this.mode = "opener"
        const text = this.loadMessage("opener")
        await this.sendImage("opener")
        await this.sendText(text)

        this.user = {}
        this.count = 0
        await this.sendText("Имя девушки?")
    }

    async openerDialog(msg){
        const text = msg.text
        this.count++;

        if (this.count === 1){
            this.user["name"] = text;
            await this.sendText("Сколько ей лет?")
        }
        if (this.count === 2){
            this.user["age"] = text;
            await this.sendText("Уровень интеллекта 1-100")
        }
        if (this.count === 3){
            this.user["IQ"] = text;
            await this.sendText("Кем она работает?")
        }
        if (this.count === 4){
            this.user["occupation"] = text;
            await this.sendText("Цели знакомства?")
        }
        if (this.count === 5){
            this.user["goals"] = text;

            const prompt = this.loadPrompt("opener")
            const info = userInfoToString(this.user)
            const myMessage = await this.sendText("ChatGPT генерирует Ваше сообщение...")
            const answer = await chatgpt.sendQuestion(prompt, info)
            await this.editText(myMessage, answer)
        }
    }

    async hello(msg){
        if (this.mode === "gpt")
            await this.gptDialog(msg);
        else if (this.mode === "date")
            await this.dateDialog(msg)
        else if (this.mode === "message")
            await this.messageDialog(msg)
        else if (this.mode === "profile")
            await this.profileDialog(msg)
        else if (this.mode === "opener")
            await this.openerDialog(msg)
        else {
            const text = msg.text;
            await this.sendText("<b>Привет!</b>")
            await this.sendText("<i>Как дела?</i>")
            await this.sendText(`Вы писали: ${text}`)

            await this.sendImage("avatar_main")

            await this.sendTextButtons("Какая у Вас тема в Телеграм?", {
            "theme_light":"Светлая",
            "theme_dark":"Темная"
             })

        }
    }

    async helloButton(callbackQuery){
       const query = callbackQuery.data;
       if (query === "theme_light")
           await this.sendText("У Вас светлая тема")
        else if (query === "theme_dark")
           await this.sendText("У Вас темная тема")
    }
}
const chatgpt = new ChatGptService("gpt:9p4dgMGH8xaays5cTFbEJFkblB3TGdVvUMGZg2yosnt0BhOs")
const bot = new MyTelegramBot("7544994187:AAGZB2TM-xLrhNAbQaTXRm-mM9NUsikY6h8");

bot.onCommand(/\/start/, bot.start)
bot.onCommand(/\/html/, bot.html)
bot.onCommand(/\/gpt/, bot.gpt)
bot.onCommand(/\/date/, bot.date)
bot.onCommand(/\/message/, bot.message)
bot.onCommand(/\/profile/, bot.profile)
bot.onCommand(/\/opener/, bot.opener)


bot.onTextMessage(bot.hello)
bot.onButtonCallback(/^date_.*/, bot.dateButton)
bot.onButtonCallback(/^message_.*/, bot.messageButton)
bot.onButtonCallback(/^.*/, bot.helloButton)