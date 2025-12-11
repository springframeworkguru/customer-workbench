Your task is to create a utility for creating test data. 

In the package `com.s7fundops.customerworkbench.bootstrap` create a new class called `DataUtil`. This class will  
have four static methods for ease of use. 

The first method will return an instance of `InteractionLogDto` and will populate the data as follows:
- id - epoch time
- productId - use datafaker Code provider to generate a ena8 code.
- customerId - use datafaker Code provider to generate a ena8 code.
- customer rating random number between 1 and 5. 
- feedback - string quote string using the datafaker provider for a Chuck Norris fact. 
- timestamp - current time - minus random 1 - 60 days.
- responses - string from datafaker using quote from the Back to the Future provider.

The second method will call the first method for a populated object and return a string in JSON format.

The third method will call the first method for a populated object and return a CSV string using OpenCSV. (Do not return 
the CSV header row)

The final method is a convenience method which will return just the CSV header for the `InteractionLogDto`.