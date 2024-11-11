public with sharing class ProductRequestController {
    @AuraEnabled
    public static String sendProductRequest(String requestWrapper) {
        try {
            ProductRequestWrapper wrapper = (ProductRequestWrapper) JSON.deserialize(requestWrapper, ProductRequestWrapper.class);
            System.debug('Deserialized Wrapper: ' + JSON.serializePretty(wrapper));

            Product_Request__c productRequest = new Product_Request__c();
            // Set productRequest fields...
            productRequest.Material_Number__c = wrapper.materialNumber;
            productRequest.Article_Name__c = wrapper.articleName;
            productRequest.Application__c = wrapper.application;
            productRequest.Machine_Type__c = wrapper.machineType;
            productRequest.Serial_Number__c = wrapper.serialNumber;
            productRequest.Shaft_Diameter__c = wrapper.shaftDiameter;
            productRequest.Rotation_Speed__c = wrapper.rotationSpeed;
            productRequest.Machine_TAG__c = wrapper.machineTag;
            productRequest.Pressure__c = wrapper.pressure;
            productRequest.Temperature__c = wrapper.temperature;
            productRequest.Medium__c = wrapper.medium;
            productRequest.Abrasive_Particles_in_Medium__c = wrapper.abrasiveParticles;
            productRequest.Product_Category__c = wrapper.productCategory;
            productRequest.Sealing_Supply_System__c = wrapper.sealingSupplySystemInput;
            productRequest.Plan__c = wrapper.planInput;
            productRequest.Operating_Location__c = wrapper.operatingLocationInput;
            productRequest.Additional_Info__c = wrapper.additionalInfoInput;
            productRequest.Application_Input__c = wrapper.applicationInput;
            productRequest.Dimensions_Seal_Chamber__c = wrapper.dimensionsSealChamberInput;
            productRequest.Movement_RPM__c = wrapper.movementRPMInput;
            productRequest.Geometry__c = wrapper.geometryInput;
            productRequest.Gasket_Geometry__c = wrapper.gasketgeometryInput;
            productRequest.Screws__c = wrapper.screwsInput;
            productRequest.Product_Requirement__c = wrapper.othersInput;
            productRequest.Title__c = wrapper.title;
            productRequest.First_Name__c = wrapper.firstName;
            productRequest.Last_Name__c = wrapper.lastName;
            productRequest.Email__c = wrapper.email;
            productRequest.Phone_Number__c = wrapper.phoneNumber;
            productRequest.Customer_Number__c = wrapper.customerNumber;
            productRequest.Message__c = wrapper.msgInput;
            productRequest.Preferred_Quantity__c = wrapper.preferredQuantity;
            productRequest.Certificates__c = String.join(wrapper.selectedCertificates, ';');

            insert productRequest;

            sendEmail(wrapper, productRequest.Id);


            return productRequest.Id;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred: ' + e.getMessage());
        }
    }

    @TestVisible
    private static void sendEmail(ProductRequestWrapper wrapper, Id productRequestId) {
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
    }
    
    private static String buildEmailBody(ProductRequestWrapper wrapper) {
        String body = 'New Product Request Details:\n\n';
        body += 'Material Number:\t' + wrapper.materialNumber + '\n';
        body += 'Article Name:\t' + wrapper.articleName + '\n';
        body += 'Application: ' + wrapper.application + '\n';
        body += 'Machine Type: ' + wrapper.machineType + '\n';
        body += 'Serial Number: ' + wrapper.serialNumber + '\n';
        body += 'Shaft Diameter: ' + wrapper.shaftDiameter + '\n';
        body += 'Rotation Speed: ' + wrapper.rotationSpeed + '\n';
        body += 'Machine TAG: ' + wrapper.machineTag + '\n';
        body += 'Pressure: ' + wrapper.pressure + '\n';
        body += 'Temperature: ' + wrapper.temperature + '\n';
        body += 'Medium: ' + wrapper.medium + '\n';
        body += 'Abrasive Particles: ' + wrapper.abrasiveParticles + '\n';
        body += 'Product Category: ' + wrapper.productCategory + '\n';
        body += 'Sealing Supply System: ' + wrapper.sealingSupplySystemInput + '\n';
        body += 'Plan: ' + wrapper.planInput + '\n';
        body += 'Operating Location: ' + wrapper.operatingLocationInput + '\n';
        body += 'Additional Info: ' + wrapper.additionalInfoInput + '\n';
        body += 'Application Input: ' + wrapper.applicationInput + '\n';
        body += 'Dimensions Seal Chamber: ' + wrapper.dimensionsSealChamberInput + '\n';
        body += 'Movement RPM: ' + wrapper.movementRPMInput + '\n';
        body += 'Geometry: ' + wrapper.geometryInput + '\n';
        body += 'Screws: ' + wrapper.screwsInput + '\n';
        body += 'Product Requirement: ' + wrapper.othersInput + '\n';
        body += 'Title: ' + wrapper.title + '\n';
        body += 'First Name: ' + wrapper.firstName + '\n';
        body += 'Last Name: ' + wrapper.lastName + '\n';
        body += 'Email: ' + wrapper.email + '\n';
        body += 'Phone Number: ' + wrapper.phoneNumber + '\n';
        body += 'Customer Number: ' + wrapper.customerNumber + '\n';
        body += 'Message: ' + wrapper.msgInput + '\n';
        body += 'Preferred Quantity: ' + wrapper.preferredQuantity + '\n';
        body += 'Selected Certificates: ' + String.join(wrapper.selectedCertificates, ', ') + '\n';
        
        return body;
    }

    //attachment 
    @AuraEnabled
    public static Id createAttachment(String parentId, String fileName, String base64Data)
    {
        try {

            Blob fileBlob = EncodingUtil.base64Decode(base64Data);
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = filename;
            contentVersion.PathOnClient = filename;
            contentVersion.VersionData = fileBlob;
            contentVersion.firstPublishLocationId = parentId;
            insert contentVersion;

            return [SELECT ContentDocumentId from ContentVersion  where Id = :contentVersion.Id].ContentDocumentId;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred while uploading the file: ' + e.getMessage());
        }
    }

    //Wrapper Class for the Product Request Form

    public class ProductRequestWrapper {
        @AuraEnabled public String materialNumber;
        @AuraEnabled public String articleName;
        @AuraEnabled public String application;
        @AuraEnabled public String machineType;
        @AuraEnabled public String serialNumber;
        @AuraEnabled public Integer shaftDiameter;
        @AuraEnabled public Integer rotationSpeed;
        @AuraEnabled public String machineTag;
        @AuraEnabled public Integer pressure;
        @AuraEnabled public Integer temperature;
        @AuraEnabled public String medium;
        @AuraEnabled public String abrasiveParticles;
        @AuraEnabled public String productCategory;
        @AuraEnabled public String sealingSupplySystemInput;
        @AuraEnabled public String planInput;
        @AuraEnabled public String operatingLocationInput;
        @AuraEnabled public String additionalInfoInput;
        @AuraEnabled public String applicationInput;
        @AuraEnabled public String dimensionsSealChamberInput;
        @AuraEnabled public Integer movementRPMInput;
        @AuraEnabled public String geometryInput;
        @AuraEnabled public String gasketgeometryInput;
        @AuraEnabled public String screwsInput;
        @AuraEnabled public String othersInput;
        @AuraEnabled public String title;
        @AuraEnabled public String firstName;
        @AuraEnabled public String lastName;
        @AuraEnabled public String email;
        @AuraEnabled public String phoneNumber;
        @AuraEnabled public String customerNumber;
        @AuraEnabled public String msgInput;
        @AuraEnabled public Integer preferredQuantity;
        @AuraEnabled public List<String> selectedCertificates;
    }
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