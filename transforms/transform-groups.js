var separator = require("../config").separator;

module.exports = {

    transformGroupList(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "name": item.name.value,
                "url": item.url ? item.url.value : "N/A",
                "members": item.members ? item.members.value : 0,
                "gocams": item.gocams ? item.gocams.value : 0,
            }
        });
        resultCallback(null, jsmodified);
    },


    transformGroupListDetails(json, resultCallback) {
        var jsmodified = json.map(function (item) {
            return {
                "name": item.name.value,
                "url": item.url ? item.url.value : "N/A",
                "membersOrcid": item.membersOrcid ? item.membersOrcid.value.split(separator) : "N/A",
                "membersName": item.membersName ? item.membersName.value.split(separator) : "N/A",
                "modelsList": item.modelsList ? item.modelsList.value.split(separator) : "N/A",
                "titlesList": item.titlesList ? splitTrim(item.titlesList.value, separator) : "N/A",
            }
        });
        resultCallback(null, jsmodified);
    }

}