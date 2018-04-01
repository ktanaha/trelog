/**
 * サンプル発話
 * 
 * ベンチプレス
 * 50キログラムです
 * 10回やりました
 * 3セットやりました
 */

'use strict';

const Alexa = require('alexa-sdk');

// 日本時間に合わせる
process.env.TZ = "Asia/Tokyo";

// STOP CANCEL
const END_MESSAGE = '記録せずに終了します。';

const states = {
    TRANINGTYPEMODE: '_TRANINGTYPEMODE',
    TRANINGAMOUNTMODE: '_TRANINGAMOUNTMODE',
    TRANINGSAVEMODE: '_TRANINGSAVEMODE',
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.dynamoDBTableName = 'TraningRecordTable';
    alexa.appID = 'amzn1.ask.skill.3d1b5592-dc18-4434-a326-e5d99b3d9d5e';
    alexa.registerHandlers(handlers, startSessionHandlers, traningHandlers, amountHandlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('StartSession');
    },
    'StartOverIntent': function () {
        this.emit('StartSession');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', '今日やった筋トレを記録します', '今日やった筋トレを記録します。');
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', END_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', END_MESSAGE);
    },
};

// 開始時のハンドラ
const startSessionHandlers = {
    'StartSession': function () {
        this.handler.state = states.TRANINGTYPEMODE;
        this.emit(':ask', '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。');
    },
    'AMAZON.HelpIntent': function () {
        const message = '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。';
        this.emit(':ask', message, message);
    },
    'AMAZON.CancelIntent': function ()  {
        this.handler.state = '';
        delete this.attributes['STATE'];
        
        this.emit(':tell', END_MESSAGE);
    },
    'AMAZON.StopIntent': function ()  {
        this.handler.state = '';
        delete this.attributes['STATE'];
        
        this.emit(':tell', END_MESSAGE);
    },
    'Unhandled': function() {
        this.handler.state = '';
        delete this.attributes['STATE'];
        
        const message = 'すみません、もう一度トレーニングした種目を教えてください。';
        this.emit(':ask', message, message);
    }   
};

// トレーニングメニューのハンドラ
const traningHandlers = Alexa.CreateStateHandler(states.TRANINGTYPEMODE, {  
    'TrainingIntent': function () {
        this.handler.state = states.TRANINGAMOUNTMODE;
        const now = new Date();
        this.attributes['now'] = now.toString();
        const name = {'name': this.event.request.intent.slots.Traning.value};
        //this.attributes[now.toString()] = {};
        this.attributes[now.toString()] = {'name': this.event.request.intent.slots.Traning.value};

        this.emit(':ask', '次にウェイトや回数、セット数を教えてください');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。', '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。');
    },
    'AMAZON.CancelIntent': function ()  {
        this.handler.state = '';
        delete this.attributes['STATE'];

        this.emit(':tell', END_MESSAGE);
    },
    'AMAZON.StopIntent': function ()  {
        this.handler.state = '';
        delete this.attributes['STATE'];

        this.emit(':tell', END_MESSAGE);
    },
    'Unhandled': function() {
        const message = 'すみませんもう一度ウェイトや回数、セット数を教えてください';
        this.emit(':ask', message, message);
    } 
});

// ウェイト・回数・セット数のハンドラ
const amountHandlers = Alexa.CreateStateHandler(states.TRANINGAMOUNTMODE, {  
    'AmountIntent': function () {
        const now = this.attributes['now'];
        const weight = this.event.request.intent.slots.Weight.value;
        if (weight) {
            this.attributes[now]['weight'] = this.event.request.intent.slots.Weight.value;
            //this.attributes['weight'] = weight;
        }
        const count = this.event.request.intent.slots.Count.value;
        this.attributes[now]['count'] = this.event.request.intent.slots.Count.value;
        //this.attributes['count'] = count;
        
        const span = this.event.request.intent.slots.Span.value;
        this.attributes[now]['span'] = this.event.request.intent.slots.Span.value;
        //this.attributes['span'] = span;
        
        this.handler.state = '';
        delete this.attributes['STATE'];
        
        if (weight) {
            this.emit(':tell', weight + 'キロを' + count + '回、' + span + 'セットですね。記録しました！');
        } else {
            this.emit(':tell', count + '回、' + span + 'セットですね。記録しました！');
        }
        
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。', '今日の筋トレを記録します。まずはどんな種目をしたのか教えてください。');
    },
    'AMAZON.CancelIntent': function ()  {
        this.handler.state = '';
        this.attributes['name'];
        delete this.attributes['STATE'];
        delete this.attributes['name'];

        this.emit(':tell', END_MESSAGE);
    },
    'AMAZON.StopIntent': function ()  {
        this.handler.state = '';
        this.attributes['name']
        delete this.attributes['STATE'];
        delete this.attributes['name'];

        this.emit(':tell', END_MESSAGE);
    },
});