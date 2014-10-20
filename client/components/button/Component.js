// define a new (simple) UIComponent
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.m.Button");
jQuery.sap.declare("components.button.Component");

// new Component
sap.ui.core.UIComponent.extend("components.button.Component", {

    metadata: {
        properties: {
            text: "string"
        }
    }

});


components.button.Component.prototype.createContent = function() {
    this.oButton = new sap.m.Button(this.createId("btn"));
    return this.oButton;
};

/*
 * Overrides setText method of the component to set this text in the button
 */
components.button.Component.prototype.setText = function(sText) {
    this.oButton.setText(sText);
    this.setProperty("text", sText);
    return this;
};

var viseo = {};

viseo.Button = function(id, configuration) {

    // You can also create a component and container at once. 
    // In this example the container will create a new component according to the name.
    var myComp = new sap.ui.core.ComponentContainer("CompCont2", {
        name: "components.button",
        id: id,
        settings: configuration
    });

    return myComp;
}
