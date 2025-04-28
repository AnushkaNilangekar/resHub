package com._7.reshub.reshub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
@RestController
@EnableScheduling
public class ReshubApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReshubApplication.class, args);
	}

	@GetMapping("/hello")
	public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
		return String.format("Hello %s!", name);
	}

	@GetMapping("/listtables")
	public List<String> listTables() {

		// Set up AWS credentials
		ProfileCredentialsProvider credentialsProvider = ProfileCredentialsProvider.create();

		DynamoDbClient dynamoDbClient = DynamoDbClient.builder()
				.httpClientBuilder(UrlConnectionHttpClient.builder()) // Explicitly set HTTP client
				.credentialsProvider(credentialsProvider)
				.build();

		// List DynamoDB tables
		ListTablesRequest request = ListTablesRequest.builder().build();
		ListTablesResponse response = dynamoDbClient.listTables(request);

		System.out.println("Tables in DynamoDB:");
		response.tableNames().forEach(System.out::println);

		return response.tableNames();
	}

	@GetMapping("/addressbookitem")
	public String addressBookItem(@RequestParam String firstName, @RequestParam String lastName) {
		try {
			// Set up AWS credentials
			ProfileCredentialsProvider credentialsProvider = ProfileCredentialsProvider.create();

			DynamoDbClient dynamoDbClient = DynamoDbClient.builder()
					.httpClientBuilder(UrlConnectionHttpClient.builder()) // Explicitly set HTTP client
					.credentialsProvider(credentialsProvider)
					.build();

			// Create a key with both partition key and sort key
			Map<String, AttributeValue> key = new HashMap<>();
			key.put("first_name", AttributeValue.builder().s(firstName).build());
			key.put("last_name", AttributeValue.builder().s(lastName).build());


			// Create GetItem request with both partition and sort keys
			GetItemRequest request = GetItemRequest.builder()
					.tableName("backend_test_phonebook")
					.key(key)
					.build();

			// Fetch the item
			GetItemResponse response = dynamoDbClient.getItem(request);

			// Check if the item exists and extract details
			if (response.hasItem()) {
				Map<String, AttributeValue> item = response.item();
				String phoneNumber = item.get("phone_number") != null ? item.get("phone_number").s() : "N/A";
				String address = item.get("address") != null ? item.get("address").s() : "N/A";

				return String.format("Name: %s %s, Phone: %s, Address: %s", firstName, lastName, phoneNumber, address);
			} else {
				return String.format("No item found with first_name = %s and last_name = %s", firstName, lastName);
			}

		} catch (Exception e) {
			// Log the exception and return error message
			e.printStackTrace();
			return "Error: " + e.getMessage();
		}
	}

	@GetMapping("/addtoaddressbook")
	public String addToAddressBook(@RequestParam String firstName,
								   @RequestParam String lastName,
								   @RequestParam String address,
								   @RequestParam String phoneNumber) {
		try {
			// Set up AWS credentials
			ProfileCredentialsProvider credentialsProvider = ProfileCredentialsProvider.create();

			DynamoDbClient dynamoDbClient = DynamoDbClient.builder()
					.httpClientBuilder(UrlConnectionHttpClient.builder())
					.credentialsProvider(credentialsProvider)
					.build();

			// Create a new item to add to the address book
			Map<String, AttributeValue> item = new HashMap<>();
			item.put("first_name", AttributeValue.builder().s(firstName).build());
			item.put("last_name", AttributeValue.builder().s(lastName).build());
			item.put("address", AttributeValue.builder().s(address).build());
			item.put("phone_number", AttributeValue.builder().s(phoneNumber).build());

			// Create PutItem request
			PutItemRequest request = PutItemRequest.builder()
					.tableName("backend_test_phonebook")
					.item(item)
					.build();

			// Put the item in DynamoDB
			dynamoDbClient.putItem(request);

			return "Item added successfully!";
		} catch (Exception e) {
			e.printStackTrace();
			return "Error: " + e.getMessage();
		}
	}

	@GetMapping("/addressbook")
	public String getAddressBook() {
		try {
			// Set up AWS credentials
			ProfileCredentialsProvider credentialsProvider = ProfileCredentialsProvider.create();

			DynamoDbClient dynamoDbClient = DynamoDbClient.builder()
					.httpClientBuilder(UrlConnectionHttpClient.builder())
					.credentialsProvider(credentialsProvider)
					.build();

			// Scan the table to get all items
			ScanRequest scanRequest = ScanRequest.builder()
					.tableName("backend_test_phonebook")
					.build();

			ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);

			// Collect items into a string to print
			StringBuilder addressBook = new StringBuilder();
			for (Map<String, AttributeValue> item : scanResponse.items()) {
				String firstName = item.get("first_name") != null ? item.get("first_name").s() : "N/A";
				String lastName = item.get("last_name") != null ? item.get("last_name").s() : "N/A";
				String phoneNumber = item.get("phone_number") != null ? item.get("phone_number").s() : "N/A";
				String address = item.get("address") != null ? item.get("address").s() : "N/A";

				// Append item details to result string
				addressBook.append(String.format("\nName: %s %s, Phone: %s, Address: %s\n", firstName, lastName, phoneNumber, address));
			}

			// If no items are found
			if (addressBook.length() == 0) {
				return "No items found in the address book.";
			}

			return addressBook.toString();
		} catch (Exception e) {
			e.printStackTrace();
			return "Error: " + e.getMessage();
		}
	}
}

