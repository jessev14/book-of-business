import { BusinessSheet } from "./BusinessSheet.js";

export const moduleName = "book-of-business";


Hooks.once("init", () => {
    // Register business sheet for vehicle-type actors
    Actors.registerSheet(moduleName, BusinessSheet, {
        types: ["vehicle"],
        makeDefault: false,
        label: "Business Sheet"
    });
});


// Add "Business" type option when creating new actor
Hooks.on("renderDialog", (app, html, appData) => {
    if (app.data.title !== "Create New Actor") return;

    html.find(`select[name="type"]`).append(`
        <option value="vehicle">Business</option>
    `);

    html.find(`button.dialog-button.ok`).click(ev => {
        if (html.find(`option:selected`).text() !== "Business") return;

        // Set newly created actor's sheet class to be BusinessSheet and update ability scores
        Hooks.once("preCreateActor", (actor, data, options, userID) => {
            actor.data.update({
                flags: {
                    core: {
                        sheetClass: `${moduleName}.BusinessSheet`
                    }
                },
                data: {
                    abilities: {
                        cha: { value: 10 },
                        int: { value: 10 },
                        wis: { value: 10 }
                    }
                }
            });
        });
    });
});
