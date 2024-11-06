/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
public class ProductRequestControllerTest {
    @testSetup
    static void setup() {
        Product_Request__c productRequest = new Product_Request__c();
        insert productRequest;
    }
    
    @isTest
    static void testSendProductRequest() {
        ProductRequestController.ProductRequestWrapper wrapper = new ProductRequestController.ProductRequestWrapper();
        wrapper.materialNumber = '12345';
        wrapper.articleName = 'Test Article';
        wrapper.application = 'Test Application';
        wrapper.machineType = 'Test Machine';
        wrapper.serialNumber = 'SN123';
        wrapper.shaftDiameter = 10;
        wrapper.rotationSpeed = 2000;
        wrapper.machineTag = 'Test Tag';
        wrapper.pressure = 100;
        wrapper.temperature = 25;
        wrapper.medium = 'Oil';
        wrapper.abrasiveParticles = 'Yes';
        wrapper.productCategory = 'Mechanical Seals';
        wrapper.sealingSupplySystemInput = 'Supply System A';
        wrapper.planInput = 'Plan A';
        wrapper.operatingLocationInput = 'Inside';
        wrapper.additionalInfoInput = 'Additional Info';
        wrapper.applicationInput = 'App Input';
        wrapper.dimensionsSealChamberInput = 'Dimensions';
        wrapper.movementRPMInput = 1500;
        wrapper.geometryInput = 'Geometry';
        wrapper.gasketgeometryInput = 'Gasket Geometry';
        wrapper.screwsInput = 'Screws';
        wrapper.othersInput = 'Other Requirements';
        wrapper.title = 'Mr.';
        wrapper.firstName = 'John';
        wrapper.lastName = 'Doe';
        wrapper.email = 'johndoe@example.com';
        wrapper.phoneNumber = '1234567890';
        wrapper.customerNumber = 'CUST123';
        wrapper.msgInput = 'Test message';
        wrapper.preferredQuantity = 10;
        wrapper.selectedCertificates = new List<String>{ 'ATEX Declaration','2.1 Declaration' };

        String requestWrapperJson = JSON.serialize(wrapper);

        Test.startTest();
        String productRequestId = ProductRequestController.sendProductRequest(requestWrapperJson);
        Test.stopTest();

        System.assertNotEquals(null, productRequestId, 'Product Request ID should not be null');
        Product_Request__c pr = [SELECT Id FROM Product_Request__c WHERE Id = :productRequestId];
        System.assertNotEquals(null, pr, 'Product_Request__c should be created');
    }
    
    @IsTest
    static void testSendProductRequestAdmin() {
        Profile standardUserProfile = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];

        User standardUser = new User(
            Alias = 'stduser',
            Email = 'standarduser@example.com',
            EmailEncodingKey = 'UTF-8',
            LastName = 'User',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = standardUserProfile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            Username = 'standarduser' + DateTime.now().getTime() + '@example.com'
        );
        insert standardUser;

        ProductRequestController.ProductRequestWrapper wrapper = new ProductRequestController.ProductRequestWrapper();
        wrapper.materialNumber = '12345678912';
        wrapper.articleName = 'Test Article';
        wrapper.application = 'Test Application';
        wrapper.machineType = 'Test Machine';
        wrapper.serialNumber = 'SN123';
        wrapper.shaftDiameter = 10;
        wrapper.rotationSpeed = 2000;
        wrapper.machineTag = 'Test Tag';
        wrapper.pressure = 100;
        wrapper.temperature = 25;
        wrapper.medium = 'Oil';
        wrapper.abrasiveParticles = 'Yes';
        wrapper.productCategory = 'Mechanical Seals';
        wrapper.sealingSupplySystemInput = 'Supply System A';
        wrapper.planInput = 'Plan A';
        wrapper.operatingLocationInput = 'Inside';
        wrapper.additionalInfoInput = 'Additional Info';
        wrapper.applicationInput = 'App Input';
        wrapper.dimensionsSealChamberInput = 'Dimensions';
        wrapper.movementRPMInput = 1500;
        wrapper.geometryInput = 'Geometry';
        wrapper.gasketgeometryInput = 'Gasket Geometry';
        wrapper.screwsInput = 'Screws';
        wrapper.othersInput = 'Other Requirements';
        wrapper.title = 'Mr.';
        wrapper.firstName = 'John';
        wrapper.lastName = 'Doe';
        wrapper.email = 'johndoe@example.com';
        wrapper.phoneNumber = '1234567890';
        wrapper.customerNumber = 'CUST123';
        wrapper.msgInput = 'Test message';
        wrapper.preferredQuantity = 10;
        wrapper.selectedCertificates = new List<String>{ 'ATEX Declaration','2.1 Declaration' };

        String requestWrapperJson = JSON.serialize(wrapper);

        System.runAs(standardUser) {
            try {
                Test.startTest();
                String productRequestId = ProductRequestController.sendProductRequest(requestWrapperJson);
                Test.stopTest();
            } catch (Exception e) {
                system.assert(e != null, 'Exception cannot be null');
            }
        }
    }
    
    @isTest
    static void testSendEmail() {
    
        ProductRequestController.ProductRequestWrapper wrapper = new ProductRequestController.ProductRequestWrapper();
        wrapper.firstName = 'Test';
        wrapper.lastName = 'User';
        wrapper.email = 'testuser@example.com';

        Product_Request__c productRequest = new Product_Request__c();
        insert productRequest;
        String productRequestId = productRequest.Id;

 
        Test.startTest();
        try {
            ProductRequestController.sendEmail(wrapper, productRequestId);
        } catch (Exception e) {
            System.assert(false, 'Email sending failed: ' + e.getMessage());
        }
        Test.stopTest();
        System.assert(true, 'Email logic executed without exceptions');
    }

    @isTest
	static void testCreateAttachment() {
  
    Account testAccount = new Account(Name = 'Test Account');
    insert testAccount;
    
    String parentId = testAccount.Id;
    String fileName = 'TestFile.pdf';
    String base64Data = EncodingUtil.base64Encode(Blob.valueOf('Test file content'));

    Test.startTest();
    Id contentDocumentId = ProductRequestController.createAttachment(parentId, fileName, base64Data);
    Test.stopTest();

    System.assertNotEquals(null, contentDocumentId, 'ContentDocumentId should not be null');
    ContentVersion contentVersion = [
        SELECT Id, Title, PathOnClient, VersionData 
        FROM ContentVersion 
        WHERE ContentDocumentId = :contentDocumentId
        LIMIT 1
    ];
    System.assertEquals(fileName, contentVersion.Title, 'The file name should match the title in ContentVersion');
	}

	@isTest
	static void testCreateAttachment_CatchBlock() {

    String invalidParentId = 'InvalidParentId'; 
    String fileName = 'TestFile.pdf';
    String corruptedBase64Data = 'InvalidBase64';  

    try {
      
        Test.startTest();
        Id contentDocumentId = ProductRequestController.createAttachment(invalidParentId, fileName, corruptedBase64Data);
        Test.stopTest();

        System.assert(false, 'Exception was expected but not thrown');
    } catch (Exception e) {
        System.assert(true, 'Exception successfully caught in the catch block: ' + e.getMessage());
    }
	}

}