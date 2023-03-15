import json
import boto3

def delete_faces_from_collection(collection_id, faces):
    client=boto3.client('rekognition')

    response=client.delete_faces(CollectionId=collection_id,
                               FaceIds=faces)
    
    print(str(len(response['DeletedFaces'])) + ' faces deleted:') 							
    for faceId in response['DeletedFaces']:
         print (faceId)
    return len(response['DeletedFaces'])


# ============================================================
def lambda_handler(event, context):
    collection_id='cvision'
    
    faces_list=list_faces_in_collection(collection_id)
    #print("faces count: " + str(faces_count))
    
    #faces=[]
    #faces.append("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    #faces_count=delete_faces_from_collection(collection_id, faces_list)
    #print("deleted faces count: " + str(faces_count))
    
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
    
# ============================================================
def list_faces_in_collection(collection_id):
    maxResults=120
    faces_count=0
    tokens=True
    face_included = []

    client=boto3.client('rekognition')
    response=client.list_faces(CollectionId=collection_id,
                               MaxResults=maxResults)

    print('Faces in collection ' + collection_id)

    while tokens:
        
        faces=response['Faces']
        
        for face in faces:
            print (face['FaceId'])
            faces_count+=1
            face_included.append(face['FaceId'])
        if 'NextToken' in response:
            nextToken=response['NextToken']
            response=client.list_faces(CollectionId=collection_id,
                                       NextToken=nextToken,MaxResults=maxResults)
        else:
            tokens=False
    return face_included