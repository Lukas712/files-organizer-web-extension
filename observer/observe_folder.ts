
import { Listener } from "./listener.js";

export class Observer{
    private listeners: Listener[];

    constructor(){
        console.log("Observer initialized");
        this.listeners = [];
        chrome.downloads.onDeterminingFilename.addListener(
            (item, suggest) => {
            for(const listener of this.listeners){
                const suggestion = listener.onNotify(item);
                if(suggestion){
                    suggest(suggestion);
                    return;
                }
            }
            suggest();
        });
    }

    public addListener(listener: Listener): void{
        this.listeners.push(listener);
    }
}