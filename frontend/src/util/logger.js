import {ConsoleAppender, Levels, Likelog, ServerAppender} from "likelog";
import {API_URL} from "./consts";

export default function getLogger(name) {
    return new Likelog({
        handleAllErrors: true,
        appenders: [
            new ConsoleAppender({
                name: name,
                showDate: false,
                showLevels: [Levels.TRACE, Levels.DEBUG, Levels.INFO, Levels.WARN, Levels.ERROR],
            }),
            // new ServerAppender({
            //     url: API_URL + '/log',
            //     name: name,
            //     sendInterval: 3000,
            //     maxCacheSize: 1000,
            //     muteErrors: true,
            //     showLevels: [Levels.WARN, Levels.ERROR],
            // }),
        ],
    });
}
