


class UserField {

    constructor(refStructureName, companyName, fields) {
        this.refStructureName=refStructureName;
        this.companyName=companyName;
        this.fields=fields;
    }

}

class UserFieldsDto {

    constructor(fieldList) {
        this.fieldList=fieldList;
    }

}

module.exports = UserField;
module.exports = UserFieldsDto;