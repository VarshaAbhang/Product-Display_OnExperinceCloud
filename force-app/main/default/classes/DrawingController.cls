public with sharing class DrawingController {
    @AuraEnabled(cacheable=true)
    public static String getCurrentUserProfile() {
        return [SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()].Profile.Name;
    }

    @AuraEnabled(cacheable=true)
    public static List<Drawing__c> fetchDrawings(String itemFamily, String itemCategory) {
        String query = 'SELECT Id, Name, Drawing_Image__c, Code__c, Product_Features__c, Assebly_Drawing__c, Advantages__c, Operating_range__c, Materials__c FROM Drawing__c WHERE Public__c = true';

        if (!String.isEmpty(itemFamily)) {
            query += ' AND Item_Family__c = :itemFamily';
        }

        if (!String.isEmpty(itemCategory)) {
            query += ' AND Item_Category__c = :itemCategory';
        }

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static Drawing__c fetchDrawingById(String drawingId) {
        return [SELECT Id, Name, Drawing_Image__c, Code__c, Product_Features__c, Assebly_Drawing__c, Advantages__c, Operating_range__c, Materials__c
                FROM Drawing__c WHERE Id = :drawingId];
    }


    @AuraEnabled(cacheable=true)
    public static List<Drawing__c> fetchRelatedDrawings(String drawingId) {
   
        Drawing__c selectedDrawing = [SELECT Item_Category__c FROM Drawing__c WHERE Id = :drawingId LIMIT 1];
        
        return [SELECT Id, Name, Drawing_Image__c, Code__c, Product_Features__c 
                FROM Drawing__c 
                WHERE Item_Category__c = :selectedDrawing.Item_Category__c AND Id != :drawingId];
    }

}