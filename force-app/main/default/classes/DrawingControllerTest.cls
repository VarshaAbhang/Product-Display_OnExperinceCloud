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
@IsTest
public class DrawingControllerTest {
    @testSetup
    static void setupTestData() {
       
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

       
        String validItemFamily = 'Mechanical Seal'; 
        String validItemCategory = 'Cartridge Mechanical Seal';

        Drawing__c drawing1 = new Drawing__c(
            Name = 'Drawing 1',
            Code__c = 'SD',
            Public__c = true,
            Item_Family__c = validItemFamily,
            Item_Category__c = validItemCategory,
            Drawing_Image__c = 'https://example.com/make_image'
        );
        Drawing__c drawing2 = new Drawing__c(
            Name = 'Drawing 2',
            Code__c = 'SD',
            Public__c = true,
            Item_Family__c = validItemFamily,  
            Item_Category__c = validItemCategory,
            Drawing_Image__c = 'https://example.com/size_image'
        );
        insert new List<Drawing__c>{drawing1, drawing2};

        Standard_Features__c standardFeature = new Standard_Features__c(
            Name = 'Test Feature', 
            Types__c = 'Recommended Applications' 
        );
        insert standardFeature;

       
        Drawing_Details__c detail1 = new Drawing_Details__c(
            Drawing__c = drawing1.Id, 
            Type__c = 'Recommended Applications', 
            Standard_Features__c = standardFeature.Id 
        );
        insert detail1;
    }

    static testMethod void testGetCurrentUserProfile() {
        User testUser = [SELECT Id FROM User WHERE Alias = 'stduser' LIMIT 1];
    
        System.runAs(testUser) {
            String profileName = DrawingController.getCurrentUserProfile();
            System.assertNotEquals(null, profileName, 'Profile Name should not be null');
        }
    }

    static testMethod void testFetchDrawings() {
        List<Drawing__c> results = DrawingController.fetchDrawings('Mechanical Seal', 'Cartridge Mechanical Seal', 'Test Feature', 1, 18);
        System.assert(results.size() > 0, 'Expected at least one drawing');
    }

    static testMethod void testFetchRecommendedApplicationNames() {
        List<String> appNames = DrawingController.fetchRecommendedApplicationNames();
        System.assert(appNames.contains('Test Feature'), 'Expected "Test Feature" in recommended application names');
    }

    static testMethod void testFetchDrawingById() {
        Drawing__c drawing = [SELECT Id FROM Drawing__c LIMIT 1];
        Drawing__c result = DrawingController.fetchDrawingById(drawing.Id);
        System.assertEquals(drawing.Id, result.Id, 'Fetched Drawing ID should match input ID');
    }

    static testMethod void testFetchGroupedFeaturesByDrawingId() {
        Drawing__c drawing = [SELECT Id FROM Drawing__c LIMIT 1];
        Map<String, List<String>> groupedFeatures = DrawingController.fetchGroupedFeaturesByDrawingId(drawing.Id);
        System.assert(groupedFeatures.containsKey('Recommended Applications'), 'Grouped features should include "Recommended Applications"');
    }

    static testMethod void testFetchRelatedDrawings() {
        Drawing__c drawing = [SELECT Id, Item_Family__c, Item_Category__c FROM Drawing__c LIMIT 1];
        
        List<Drawing__c> relatedDrawings = DrawingController.fetchRelatedDrawings(drawing.Id);
    
        System.debug('Related Drawings in Test: ' + relatedDrawings);
    
        System.assert(relatedDrawings.size() > 0, 'Expected related drawings');
        
        System.assert(relatedDrawings[0].Item_Family__c == drawing.Item_Family__c, 'Related drawing should share the same Item_Family__c');
        System.assert(relatedDrawings[0].Item_Category__c == drawing.Item_Category__c, 'Related drawing should share the same Item_Category__c');
    }
    
    
}
