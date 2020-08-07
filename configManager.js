let defaultConfig = require("./default5.json");
let configUtils = require("./configUtils");

let defaultConfigCopy = {};
let sectionToBeUpdated = {};
let currentUpdatableSection = [];
let selectedProperty = "";

const MergeConfigObj = (stateConfig) => {
  defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
  processStateConfig(stateConfig);
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
    GetCurrentUpdatableSection(forms.id, defaultConfigCopy);
  }
  if (forms.__property__ && forms.__action__) {
    selectedProperty = forms.__property__;
    currentUpdatableSection =
      currentUpdatableSection.length === 0
        ? defaultConfigCopy
        : currentUpdatableSection;
    findSectionById(selectedProperty, currentUpdatableSection);
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
  // console.log("defaultConfigCopy----->", JSON.stringify(defaultConfigCopy));
  if (Array.isArray(defaultConfigCopy)) {
    for (let i = 0; i < defaultConfigCopy.length; i++) {
      if (defaultConfigCopy[i].id === id) {
        currentUpdatableSection.push(defaultConfigCopy[i]);
        console.log("matched", currentUpdatableSection);
      } else if (
        configUtils.ifObjectContainsArray(defaultConfigCopy[i]).hasArray
      ) {
        let array = configUtils.ifObjectContainsArray(defaultConfigCopy[i])
          .value;
        GetCurrentUpdatableSection(id, array);
      }
    }
  }
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
  fields.splice(index, 1);
};

const deleteExtraKeys = (data) => {
  delete data.__action__;
  delete data.__property__;
};

exports.MergeConfigObj = MergeConfigObj;
