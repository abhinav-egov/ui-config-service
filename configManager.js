let defaultConfig = require("./default2.json");
let configUtils = require("./configUtils");

let defaultConfigCopy = {};
let sectionToBeUpdated = {};
const MergeConfigObj = (stateConfig) => {
  defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
  processStateConfig(stateConfig);
  return defaultConfigCopy;
};

const processStateConfig = (stateConfig) => {
  stateConfig.map((forms) => {
    processForms(forms.form);
  });
};

const processForms = (form) => {
  let sectionId = "";
  form.map((formDetails) => {
    sectionId = formDetails.id;
    traverseForm(sectionId, formDetails);
  });
};

const traverseForm = (sectionId, formDetails) => {
  formDetails.fields.map((field) => {
    if (!field.fields) {
      processFields(field, field.__property__ || field.id, sectionId);
    } else {
      traverseForm(sectionId, field);
    }
  });
};

const processFields = (field, formId, sectionId) => {
  sectionToBeUpdated = configUtils.getSectionInfo(
    formId,
    sectionId,
    defaultConfigCopy
  );
  console.log("sectionToBeUpdated---->", sectionToBeUpdated);
  if (field.__property__ && !field.__property__.includes(".")) {
    const index = getIndex(
      sectionToBeUpdated.field.id,
      sectionToBeUpdated.fields
    );
    actionHandler(index, field, sectionToBeUpdated.fields);
  } else {
    if (field.__property__ && field.__property__.includes(".")) {
      const [
        property,
        optionListName,
        optionProperty,
      ] = field.__property__.split(".");
      let { optionIndex, options } = getOptionsWithIndex(
        property,
        optionListName,
        optionProperty
      );
      actionHandler(optionIndex, field, options);
    } else {
      for (let property in field) {
        if (Array.isArray(field[property])) {
          field[property].map((data) => {
            if (data.__action__ && data.__property__) {
              let { optionIndex, options } = getOptionsWithIndex(
                field.id,
                property,
                data.__property__
              );
              actionHandler(optionIndex, data, options);
            }
          });
        }
      }
    }
  }
};

const actionHandler = (index, field, fieldList) => {
  if (!field.__action__) {
    console.log("no action found");
    return;
  }
  if (field.__action__ === "UPDATE") {
    deleteExtraKeys(field);
    updateAt(index, field, fieldList);
  }
  if (field.__action__ === "DELETE") {
    deleteExtraKeys(field);
    deleteAt(index, fieldList);
  }
  if (["INSERT_AFTER", "INSERT_BEFORE"].includes(field.__action__)) {
    handleInsertion(index, field, fieldList);
  }
};

const handleInsertion = (index, data, fields) => {
  index = data.__action__ === "INSERT_BEFORE" ? index : index + 1;
  deleteExtraKeys(data);
  insertAt(index, data, fields);
};

const getOptionsWithIndex = (property, optionListName, optionProperty) => {
  let options = sectionToBeUpdated.field[optionListName];
  let optionIndex = options.findIndex((option) => option.id === optionProperty);
  return { optionIndex, options };
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
