let defaultConfig = require("./default2.json");
let configUtils = require("./configUtils");

let defaultConfigCopy = {};
let sectionToBeUpdated = {};
let currentUpdatableSection = [];
let selectedProperty = "";

const MergeConfigObj = (stateConfig) => {
  defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
  processStateConfig(stateConfig);
  console.log(
    "defaultConfigCopy returened------->",
    JSON.stringify(defaultConfigCopy)
  );
  return defaultConfigCopy;
};

const processStateConfig = (stateConfig) => {
  if (Array.isArray(stateConfig)) {
    stateConfig.map((forms) => {
      sectionToBeUpdated = {};
      InitSectionToUpdate(forms);
    });
  }
};

const InitSectionToUpdate = (forms) => {
  if (forms.id && !forms.__property__) {
    console.log("finding current updatable section----------------");
    GetCurrentUpdatableSection(forms.id, defaultConfigCopy);
    console.log(
      "currentUpdatableSection received--------->",
      currentUpdatableSection
    );
  }
  if (forms.__property__ && forms.__action__) {
    selectedProperty = forms.__property__;
    console.log("currentUpdatableSection-->", currentUpdatableSection);
    findSectionById(selectedProperty, currentUpdatableSection);
    console.log("section to be updated-->", sectionToBeUpdated);
    seachInDefaultConfig(forms.__property__, forms);
  } else if (Array.isArray(forms)) {
    forms.map((form) => {
      InitSectionToUpdate(form);
    });
  } else if (configUtils.ifObjectContainsArray(forms).hasArray) {
    let array = configUtils.ifObjectContainsArray(forms).value;
    InitSectionToUpdate(array);
  } else {
    throw "__property__ and  __action__ not found";
  }
};

const GetCurrentUpdatableSection = (id, defaultConfigCopy) => {
  console.log("GetCurrentUpdatableSection id----->", id);
  // console.log("defaultConfigCopy----->", JSON.stringify(defaultConfigCopy));
  if (Array.isArray(defaultConfigCopy)) {
    for (let i = 0; i < defaultConfigCopy.length; i++) {
      console.log(
        "defaultConfigCopy[i] obhnye ha-------- ----",
        JSON.stringify(defaultConfigCopy[i])
      );
      // console.log("id---------------------->", id);
      if (defaultConfigCopy[i].id === id) {
        //section = defaultConfigCopy;
        currentUpdatableSection.push(defaultConfigCopy[i]);
        console.log("matched--------- id----->", currentUpdatableSection);
      } else if (
        configUtils.ifObjectContainsArray(defaultConfigCopy[i]).hasArray
      ) {
        let array = configUtils.ifObjectContainsArray(defaultConfigCopy[i])
          .value;
        GetCurrentUpdatableSection(id, array);
      }
    }
  }
  //return section;
};

const findSectionById = (id, currentUpdatableSection) => {
  if (Array.isArray(currentUpdatableSection)) {
    for (let i = 0; i < currentUpdatableSection.length; i++) {
      if (currentUpdatableSection[i].id === id) {
        sectionToBeUpdated = currentUpdatableSection;
      } else if (
        configUtils.ifObjectContainsArray(currentUpdatableSection[i]).hasArray
      ) {
        let arr = configUtils.ifObjectContainsArray(currentUpdatableSection[i])
          .value;
        findSectionById(id, arr);
      }
    }
  }
  return sectionToBeUpdated;
};

const seachInDefaultConfig = (id, action) => {
  if (sectionToBeUpdated.id === id) {
    actionHandler(action, id, sectionToBeUpdated);
  } else if (Array.isArray(sectionToBeUpdated)) {
    sectionToBeUpdated.map((section) => {
      if (section.id === id) {
        console.log("action handler--------->");
        console.log(
          "section to be updated--------------------->",
          JSON.stringify(sectionToBeUpdated),
          action
        );
        actionHandler(action, id, sectionToBeUpdated);
      }
    });
  } else if (configUtils.ifObjectContainsArray(sectionToBeUpdated).hasArray) {
    sectionToBeUpdated = configUtils.ifObjectContainsArray(sectionToBeUpdated)
      .value;
    seachInDefaultConfig(id, action);
  }
};

const actionHandler = (action, id, fieldList) => {
  const index = getIndex(id, fieldList);
  if (!action) {
    console.log("no action found");
    return;
  }
  if (action.__action__ === "UPDATE") {
    updateAt(index, action, fieldList);
    deleteExtraKeys(action);
  }
  if (action.__action__ === "DELETE") {
    deleteAt(index, fieldList);
    deleteExtraKeys(action);
  }
  if (["INSERT_AFTER", "INSERT_BEFORE"].includes(action.__action__)) {
    handleInsertion(index, action, fieldList);
  }
};

const handleInsertion = (index, action, fields) => {
  index = action.__action__ === "INSERT_BEFORE" ? index : index + 1;
  insertAt(index, action, fields);
  deleteExtraKeys(action);
};

const getIndex = (propertyValue, fields) => {
  return fields.findIndex((option) => option.id === propertyValue);
};

const insertAt = (index, data, fields) => {
  fields.splice(index, 0, data);
};

const updateAt = (index, data, fields) => {
  fields[index] = { ...fields[index], ...data };
};

const deleteAt = (index, fields) => {
  console.log("index---->", index);
  console.log("fields----->", fields);
  fields.splice(index, 1);
  console.log("section to be updated---------->", sectionToBeUpdated);
  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    JSON.stringify(currentUpdatableSection)
  );
};

const deleteExtraKeys = (data) => {
  delete data.__action__;
  delete data.__property__;
};

exports.MergeConfigObj = MergeConfigObj;
