import ActorSheet5eVehicle from "/systems/dnd5e/module/actor/sheets/vehicle.js";
import { moduleName } from "./book-of-business.js";

const abilityMap = {
    Strength: "Labour",
    Dexterity: "Image",
    Constitution: "Security",
    Intelligence: "Legal",
    Wisdom: "Finance",
    Charisma: "Morale"
};

export class BusinessSheet extends ActorSheet5eVehicle {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes.push(moduleName);

        return options;
    }

    get template() {
        return `modules/${moduleName}/templates/business-sheet.hbs`;
    }

    getData(options) {
        const data = super.getData(options);

        data.size = {
            Small: "Small",
            Medium: "Medium",
            Large: "Large",
            Huge: "Huge"
        };

        data.propertyQuality = {
            Cheap: "Cheap",
            Reasonable: "Reasonable",
            Expensive: "Expensive",
            Luxurious: "Luxurious"
        };

        for (const ability of Object.values(data.data.abilities)) {
            ability.label = abilityMap[ability.label];
        }

        const cargoItems = Object.values(data.cargo).reduce((acc, current) => {
            return acc.concat(...current.items);
        }, []);

        data.cargo = [{
            columns: [
                {
                    css: "item-qty",
                    editable: "Number",
                    label: "Upkeep",
                    property: "quantity"
                }
            ],
            css: "cargo-row crew",
            dataset: { type: "crew" },
            editableName: true,
            items: cargoItems,
            label: "Assets"
        }];
        
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(`.ability-name`).off("click");
        html.find(`.ability-name`).click(this.rollAbility.bind(this));
    }

    async rollAbility(event) {
        event.preventDefault();
        let newText;

        Hooks.once("renderDialog", (app, html, appData) => {
            const header = html.find(`h4.window-title`);
            const text = header.text();
            console.log(text)
            for (const [oldAbility, newAbility] of Object.entries(abilityMap)) {
                if (text.includes(oldAbility)) {
                    newText = text.replace(oldAbility, newAbility);
                    header.text(newText);

                    return;
                }

            }
        });

        const ability = event.currentTarget.parentElement.dataset.ability;
        const roll = await this.actor.rollAbilityTest(ability, { chatMessage: false });
        roll.options.flavor = newText;
        const messageData = {
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            "flags.dnd5e.roll": { type: "ability", ability }
        };
        roll.toMessage(messageData);
    }
}
