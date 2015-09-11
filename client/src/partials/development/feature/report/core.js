/**
 * @description 
 * Core report controller responsible for downloading report archives and
 * allowing the user to generate new reports 
 *
 * @todo 
 * Reports should be dynamically templated into the application routes, 
 * at this point there will be need to link the database report with the client
 * route
 *
 * @todo 
 * Replace report table with grid after grid analysis is performed (ui grid)
 *
 * @todo 
 * Decide on flexibility of URL structure. Current thoughts are 
 * report/{key}
 * report/{key}/{id}
 * report/{key}/generate
 * report/{key}/generate/{option_key}/{option_value}
 */
angular.module('bhima.controllers').controller('ReportCore', ReportCore);

ReportCore.$inject = ['$routeParams', 'ModuleState', 'ReportService'];

function ReportCore($routeParams, ModuleState, ReportService) { 
  
  // Anything assigned to the controller object will be exposed to the template (view)
  var viewModel = this;

  var state = new ModuleState();
  
  var reportKey = $routeParams.reportKey;
  var reportDefinition = null;

  var serverInterface = ReportService;
  
  // Set up the core report archive page
  loadDefinition(reportKey); 
  
  function loadDefinition(key) { 

    // Uses non asynchronous request method - this can be done because of the 
    // $routeProvider resolve configuration
    reportDefinition = serverInterface.requestDefinition(key);

    if (angular.isUndefined(reportDefinition)) { 

      // Report definition has not been found - BHIMA instance does not support 
      // this report - update the module state accordingly 
      state.invalidateModule();
    } else { 

      // Found report definition - settup module page
      state.validateModule();
      settupCoreReport(reportDefinition);
    }
  }
  
  function settupCoreReport(definition) { 
    
    // Customize view
    viewModel.title = definition.title;
    
    // TODO Use semantic methods
    state.isLoading = true;

    // Fetch archives 
    serverInterface.fetchArchive(definition.id)
      .then(settupArchive);
      // TODO .catch()

    // Customize generation model
    
    // Hook up recurring report configuration 
    
    // Hook up settings
  }

  /**
   * @params {Object} options Specify any initial options for the report, this 
   * can be default values passed sepecified in the URL
   */
  function requestReport(options) { 

  }

  function settupArchive(archives) { 
    
    // TODO use semantic methods
    state.isLoading = false;

    // Update view
    updateArchivesView(archives.data); 
  }
  
  // Method to expose archives to view model, this can be called by the initial
  // settup routine as well as post report generation 
  function updateArchivesView(archivesData) { 
    var archivesEmpty = archivesData.length === 0;
    
    viewModel.archives = archivesData;
    
    // Allows semantic templating 
    viewModel.archivesEmpty = archivesEmpty;
  }
  
  // UI Utility 
  function suppressSuccess() { 
    viewModel.state.suppressSuccessDisplay = true;
  }

  // Expose state to the view model - allow selective displaying of elements
  viewModel.state = state;
  viewModel.suppressSuccess = suppressSuccess;
  viewModel.state.suppressSuccessDisplay = false;

  viewModel.reportKey = reportKey;
}
