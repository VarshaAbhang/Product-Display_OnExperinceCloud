public with sharing class ProductRequestController {
    @AuraEnabled
    public static String sendProductRequest(String requestWrapper) {
        try {
            ProductRequestWrapper wrapper = (ProductRequestWrapper) JSON.deserialize(requestWrapper, ProductRequestWrapper.class);
            System.debug('Deserialized Wrapper: ' + JSON.serializePretty(wrapper));

            Product_Request__c productRequest = new Product_Request__c();
            productRequest.Title__c = wrapper.title;
            productRequest.First_Name__c = wrapper.firstName;
            productRequest.Last_Name__c = wrapper.lastName;
            productRequest.Email__c = wrapper.email;
            productRequest.Phone_Number__c = wrapper.phoneNumber;
            productRequest.Country__c = wrapper.country;
            productRequest.Product_Name__c = wrapper.productName ;
            productRequest.Product_Family__c = wrapper.productFamily;
            productRequest.Message__c = wrapper.msgInput;
            productRequest.Website__c = wrapper.website;

            insert productRequest;

           // sendEmail(wrapper, productRequest.Id);


            return productRequest.Id;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred: ' + e.getMessage());
        }
    }

    /*private static void sendEmail(ProductRequestWrapper wrapper, Id productRequestId) {
        try {
            System.debug('Preparing to send email...');
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new String[] { 'abhangvarsha13@gmail.com' });
            email.setSubject('New Product Request from ' + wrapper.firstName + ' ' + wrapper.lastName);
            email.setPlainTextBody(buildEmailBody(wrapper));
            
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
            System.debug('Email sent successfully.');
        } catch (Exception e) {
            System.debug('Failed to send email: ' + e.getMessage());
        }
    }*/
    
    /*private static String buildEmailBody(ProductRequestWrapper wrapper) {
        String body = 'New Product Request Details:\n\n';
        body += 'Title: ' + wrapper.title + '\n';
        body += 'First Name: ' + wrapper.firstName + '\n';
        body += 'Last Name: ' + wrapper.lastName + '\n';
        body += 'Email: ' + wrapper.email + '\n';
        body += 'Phone Number: ' + wrapper.phoneNumber + '\n';
        body += 'Country: ' + wrapper.country + '\n';
        body += 'Product Name: ' + wrapper.productName + '\n';
        body += 'Message: ' + wrapper.msgInput + '\n';
        body += 'Website: ' + wrapper.website + '\n';
        
        return body;
    }*/

    public class ProductRequestWrapper {
        @AuraEnabled public String title;
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String email;
        @AuraEnabled public String phoneNumber;
        @AuraEnabled public String country;
        @AuraEnabled public String productName;
        @AuraEnabled public String productFamily;
        @AuraEnabled public String msgInput;
        @AuraEnabled public String website;
    }


 @AuraEnabled(cacheable=true)
    public static List<String> getCountryGlobalPicklistValues() {
        // Retrieve the global value set
        Schema.DescribeFieldResult describeResult = Schema.Product_Request__c.Country__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = describeResult.getPicklistValues();

        // Extract the labels
        List<String> picklistValues = new List<String>();
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getLabel());
        }
        return picklistValues;
    }

    //attachment 
    // @AuraEnabled
    // public static Id createAttachment(String parentId, String fileName, String base64Data)
    // {
    //     try {

    //         Blob fileBlob = EncodingUtil.base64Decode(base64Data);
    //         ContentVersion contentVersion = new ContentVersion();
    //         contentVersion.Title = filename;
    //         contentVersion.PathOnClient = filename;
    //         contentVersion.VersionData = fileBlob;
    //         contentVersion.firstPublishLocationId = parentId;
    //         insert contentVersion;

    //         return [SELECT ContentDocumentId from ContentVersion  where Id = :contentVersion.Id].ContentDocumentId;
    //     } catch (Exception e) {
    //         throw new AuraHandledException('An error occurred while uploading the file: ' + e.getMessage());
    //     }
    // }

    //Wrapper Class for the Product Request Form

}

    // @AuraEnabled
    // public static void createAttachment(String parentId, String fileName, String base64Data) {
    //     try {
    //         ContentVersion contentVersion = new ContentVersion();
    //         contentVersion.Title = fileName; 
    //         contentVersion.PathOnClient = fileName; 
    //         contentVersion.VersionData = EncodingUtil.base64Decode(base64Data); 
    //         contentVersion.ContentLocation = 'S'; 

    //         insert contentVersion;

    //         ContentDocumentLink documentLink = new ContentDocumentLink();
    //         documentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id].ContentDocumentId;
    //         documentLink.LinkedEntityId = parentId; 
    //         documentLink.ShareType = 'V'; 
    //         documentLink.Visibility = 'AllUsers';

    //         insert documentLink;

    //     } catch (Exception e) {
    //         throw new AuraHandledException('An error occurred while uploading the file: ' + e.getMessage());
    //     }
    // }