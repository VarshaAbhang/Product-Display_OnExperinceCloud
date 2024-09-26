public with sharing class DrawingController {
    @AuraEnabled(cacheable=true)
    public static List<Drawing__c> fetchDrawings(String itemFamily, String itemCategory) {
        // Construct the query based on the provided parameters
        String query = 'SELECT Id, Name, Drawing_Image__c, Code__c, Product_Features__c, Assebly_Drawing__c, Advantages__c, Operating_range__c,Materials__c FROM Drawing__c WHERE Public__c = true';
        
        if (!String.isEmpty(itemFamily)) {
            query += ' AND Item_Family__c = :itemFamily';
        }
        
        if (!String.isEmpty(itemCategory)) {
            query += ' AND Item_Category__c = :itemCategory';
        }
        
        return Database.query(query);
    }
}
