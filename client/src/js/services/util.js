angular.module('bhima.services')
.service('util', ['$filter', function ($filter) {

  this.formatDate = function formatDate(dateString) {
    return new Date(dateString).toDateString();
  };

  this.htmlDate = function htmlDate (date) {
    return $filter('date')(new Date(date), 'yyyy-MM-dd');
  };

  this.convertToMysqlDate = function (dateParam) {
    var date = !!dateParam ? new Date(dateParam) : new Date(),
      annee,
      mois,
      jour;
    annee = String(date.getFullYear());
    mois = String(date.getMonth() + 1);
    if (mois.length === 1) {
      mois = '0' + mois;
    }

    jour = String(date.getDate());
    if (jour.length === 1) {
      jour = '0' + jour;
    }
    return annee + '-' + mois + '-' + jour;
  };

  this.sqlDate = this.convertToMysqlDate;

  this.isDateAfter = function (date1, date2) {
    date1 = new Date(date1).setHours(0,0,0,0);
    date2 = new Date(date2).setHours(0,0,0,0);
    return date1 > date2;
  };

  this.areDatesEqual = function (date1, date2) {
    date1 = new Date(date1).setHours(0,0,0,0);
    date2 = new Date(date2).setHours(0,0,0,0);
    return date1 === date2;
  };

  this.isDateBetween = function (date, dateFrom, dateTo) {
    date = new Date(date).setHours(0,0,0,0);
    dateFrom = new Date(dateFrom).setHours(0,0,0,0);
    dateTo = new Date(dateTo).setHours(0,0,0,0);
    return ((date>=dateFrom) && (date<=dateTo));
  };

  // Normalize a name:
  //  * remove all extra whitespace
  //  * capitalize the first letter of each word in the name 
  //    (lowercase the rest of each word)
  //  * Undefined names are not changed (for form fields)
  this.normalizeName = function (name) {
    if (typeof name === 'undefined') {
      return name;
      }
    var names = name.trim().split(/\s+/);
    for(var i = 0; i < names.length; i++) {
      names[i] = names[i].charAt(0).toUpperCase() + names[i].slice(1).toLowerCase();
    }
    return names.join(' ');
  };

  // Define the minimum date for any patient data
  this.minPatientDate = new Date('1900-01-01');

}]);
