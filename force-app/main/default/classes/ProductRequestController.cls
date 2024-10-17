public with sharing class ProductRequestController {
    @AuraEnabled
    public static String sendProductRequest(String requestWrapper) {
        try {

            ProductRequestWrapper wrapper = (ProductRequestWrapper) JSON.deserialize(requestWrapper, ProductRequestWrapper.class);
            System.debug('Deserialized Wrapper: ' + JSON.serializePretty(wrapper));

            Product_Request__c productRequest = new Product_Request__c();

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
            // Optionally map other fields as needed

            insert productRequest;

            return productRequest.Id;
        } catch (Exception e) {
            throw new AuraHandledException('An error occurred: ' + e.getMessage());
        }
    }

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
