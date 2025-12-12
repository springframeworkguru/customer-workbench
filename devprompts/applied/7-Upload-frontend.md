Your task is to update the project to allow for data uploads in either JSON for CSV.

The backend controller has defined the API endpoints. Refer to the Spring MVC controller
src/main/java/com/s7fundops/customerworkbench/controller/InteractionController.java for details.

The React frontend application is located in the `/src/frontend/workbench` folder.

To complete this task, you will need to:

* Update the page `src/main/frontend/workbench/src/pages/InteractionsPage.tsx`
  - to allow the upload of a JSON file.
  - to allow the upload of a CSV file.
  - have a form dialog to submit the data of an interaction. 
* Provide unit tests for the new code.
* The directory `src/main/frontend/workbench/test` has JSON and CSV files that can be used for testing.
* Verify all the frontend project builds without errors, lint has no errors, and all tests pass.
