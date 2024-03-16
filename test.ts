
import { fakeEdgeBoost, fakeEdgeBoostComplete, fakeEdgeAction, fakeEdgeActionComplete, fakeRule, fakeRuleComplete, fakeHomebrew, fakeHomebrewComplete } from './types/fake-data';


// zb dann aufrufbar mit
const sources = ["EdgeBoost", "EdgeAction", "Rule", "Homebrew"] as any
const sourceToFakerFunctionMap = {
    "EdgeBoost": {
        "minimal": fakeEdgeBoost, "complete": fakeEdgeBoostComplete
    },
    "EdgeAction": {
        "minimal": fakeEdgeAction, "complete": fakeEdgeActionComplete
    },
    "Rule": {
        "minimal": fakeRule, "complete": fakeRuleComplete
    },
    "Homebrew": {
        "minimal": fakeHomebrew, "complete": fakeHomebrewComplete
    }
}
let fakes = {}
for (const key in sources) {
    if (Object.prototype.hasOwnProperty.call(sources, key)) {
        const source = sources[key];
        if(!fakes[source]){
            fakes[source] = {"minimal":[],"complete":[]}
        }
        for (let index = 0; index < 50; index++) {
            fakes[source].complete.push(sourceToFakerFunctionMap[source].complete())
            fakes[source].minimal.push(sourceToFakerFunctionMap[source].minimal())
        }
    }
}
Bun.write("./fake.json", JSON.stringify(fakes) )