public with sharing class DrawingController {
    @AuraEnabled(cacheable=true)
    public static String getCurrentUserProfile() {
        return [SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()].Profile.Name;
    }

    @AuraEnabled(cacheable=true)
    public static List<Drawing__c> fetchDrawings(String itemFamily, String itemCategory, String recommendedApplicationType, Integer pageNumber, Integer pageSize) {
        try {
            String query = 'SELECT Id, Name, Drawing_Image__c, Code__c, Assebly_Drawing__c, Advantages__c FROM Drawing__c WHERE Public__c = true';

            if (!String.isEmpty(itemFamily)) {
                query += ' AND Item_Family__c = :itemFamily';
            }
    
            if (!String.isEmpty(itemCategory)) {
                query += ' AND Item_Category__c = :itemCategory';
            }
    
            if (!String.isEmpty(recommendedApplicationType)) {
                query += ' AND Id IN (SELECT Drawing__c FROM Drawing_Details__c WHERE Standard_Features__r.Name = :recommendedApplicationType)';
            }
    
            // Pagination logic
            Integer offset = (pageNumber - 1) * pageSize;
            query += ' LIMIT :pageSize OFFSET :offset';
    
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching drawings: ' + e.getMessage());
        }
    }
    

    @AuraEnabled(cacheable=true)
    public static List<String> fetchRecommendedApplicationNames() {
        try {
            List<Drawing_Details__c> drawingDetails = [
                SELECT Standard_Features__r.Name 
                FROM Drawing_Details__c 
                WHERE Type__c = 'Recommended Applications'
            ];

            List<String> recommendedAppNames = new List<String>();
            for (Drawing_Details__c detail : drawingDetails) {
                if (detail.Standard_Features__r != null) {
                    recommendedAppNames.add(detail.Standard_Features__r.Name);
                }
            }

            return recommendedAppNames;

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching recommended applications: ' + e.getMessage());
        }
    }


    
    @AuraEnabled(cacheable=true)
    public static Drawing__c fetchDrawingById(String drawingId) {
        Drawing__c drawing = [SELECT Id, Name, Drawing_Image__c, Code__c, Assebly_Drawing__c, Advantages__c
                              FROM Drawing__c WHERE Id = :drawingId];
        
        return drawing;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> fetchGroupedFeaturesByDrawingId(String drawingId) {
        List<Drawing_Details__c> drawingDetails = [
            SELECT Standard_Features__r.Name, Type__c 
            FROM Drawing_Details__c 
            WHERE Drawing__c = :drawingId
        ];

        System.debug('Fetched Drawing Details: ' + drawingDetails);

        Map<String, List<String>> featuresGroupedByType = new Map<String, List<String>>();

        for (Drawing_Details__c detail : drawingDetails) {
            if (detail.Standard_Features__r != null) {
                if (!featuresGroupedByType.containsKey(detail.Type__c)) {
                    featuresGroupedByType.put(detail.Type__c, new List<String>());
                }
                featuresGroupedByType.get(detail.Type__c).add(detail.Standard_Features__r.Name);
            }
        }

        System.debug('Grouped Features Map: ' + featuresGroupedByType);
        return featuresGroupedByType;
    }




    @AuraEnabled(cacheable=true)
    public static List<Drawing__c> fetchRelatedDrawings(String drawingId) {
        // Fetch the selected drawing's Item Category
        Drawing__c selectedDrawing = [SELECT Item_Category__c FROM Drawing__c WHERE Id = :drawingId LIMIT 1];
        
        return [
            SELECT Id, Name, Drawing_Image__c, Code__c 
            FROM Drawing__c 
            WHERE Item_Category__c = :selectedDrawing.Item_Category__c 
            AND Id != :drawingId 
            AND Drawing_Image__c != NULL  
            AND Public__c = TRUE          
        ];
    }
    

}