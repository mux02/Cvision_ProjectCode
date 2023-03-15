from __future__ import print_function
import boto3
import json
import io
from PIL import Image
import pymysql
import uuid
import os
import time
from datetime import datetime

# rds settings:
rds_host = rds_config.db_endpoint
rds_username = rds_config.db_username
rds_password = rds_config.db_password
rds_db = rds_config.db_name

s3_client = boto3.client('s3')
rekognition = boto3.client('rekognition')

# --------------- Helper Functions ------------------

def index_faces(bucket, key):

    response = rekognition.index_faces(
        Image={"S3Object":
            {"Bucket": bucket,
            "Name": key}},
            CollectionId="cvision", 
            DetectionAttributes= [
            "ALL"
        ])
    return response

# --------------- Main handler ------------------
def lambda_handler(event, context):
    
    try:
        conn = pymysql.connect(host=rds_host, user=rds_username, passwd=rds_password, db=rds_db, connect_timeout=5, charset="utf8", use_unicode=True)
        print("[DB_Connection] connected to DB successfully")
    except pymysql.MySQLError as e:
        print("[DB_Connection] Error: ", e)
    
    print(event)
    
    # Get the object from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    print("Records: ", event['Records'])
    key = event['Records'][0]['s3']['object']['key']
    ETag = event['Records'][0]['s3']['object']['eTag']
    Size = event['Records'][0]['s3']['object']['size']
    XPhotoName = key.split('/')[1]
    PhotoName = XPhotoName.split('.')[0]
    print("PhotoName: ", PhotoName)
    print("Key: ", key)
    print("Bucket: ", bucket)
    
    print("getting s3 object...")
    file_byte_string = s3_client.get_object(Bucket=bucket, Key=key)['Body'].read()
    print("file_byte_string: ", file_byte_string)
    image_af = Image.open(io.BytesIO(file_byte_string))
    
    # Buffer to regenerate image into your memory
    buffer = io.BytesIO()
    # using buffer on your image with specific format
    image_af.save(buffer, "JPEG")

    # You probably want: getvalue in binary
    image_binary = buffer.getvalue()
    print("image_binary: ", image_binary) # for test

    # Calls Amazon Rekognition IndexFaces API to detect faces in S3 object
    # to index faces into specified collection
    FaceResponse = index_faces(bucket, key)  # Don't forget to uncomment

    if FaceResponse['ResponseMetadata']['HTTPStatusCode'] == 200:
        print(FaceResponse)
        faceId = FaceResponse['FaceRecords'][0]['Face']['FaceId']
        print("faceId: ", faceId)
        for item in FaceResponse['FaceRecords']:
            print("item: ", item['Face']['FaceId'])

    # ===================== UNUSED ===============================
    response = rekognition.search_faces_by_image(  # unused for now
        CollectionId='famouspersonssa',
        Image={'Bytes': image_binary}
    )
    # ============================================================

    currentPhoto_Id = int(str(hash(uuid.uuid4()))[:7])
    temp_userId = "12432"
    IncludedPeople = []
    os.environ['TZ'] = "Asia/Riyadh"
    time.tzset()
    CreatedDate = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # with conn.cursor() as cur:
    #     try:
    #         # Insert Photo ==============
    #         cur.execute('Insert into Photo (Photo_Id, Photo_Name, Photo_Type, KeyPath, ETag, Size, LastModified, Status, CreatedDate) values ( %d , "%s", "%s", "%s", "%s", %d, "%s", %d, "%s") ' % (
    #                 currentPhoto_Id, f"{PhotoName}.jpg", "jpg", key, ETag, Size, CreatedDate, 1, CreatedDate))
    #         conn.commit()
    #     except pymysql.MySQLError as e:
    #         print("Error adding photo to DB: ", e)
    #     finally:
    #         conn.commit()
    # =============================================================
    
    for indx in FaceResponse["FaceRecords"]:  # for indx in response["FaceMatches"]:
    
        currentFaceId = indx["Face"]["FaceId"]

        with conn.cursor() as cur:
            try:
                # ================================== Check Person existence ==================================
                cur.execute('SELECT Person_Id, Rekogonition_Id FROM Person WHERE Rekogonition_Id= "%s" ' % currentFaceId)
                result = cur.fetchone()
                conn.commit()

                if result:
                    # =========== if found ==============
                    print(f"Person found {result[0]}, {result[1]}")  # if found
                    
                    currentPerson_Id = result[1]
                    print("[found] currentPerson_Id: ", currentPerson_Id)
                    print("[found] currentPhoto_Id: ", currentPhoto_Id)
                    Gender_value = -1
                    # Check Gender =======================
                    if indx["FaceDetail"]["Gender"]["Value"] == 'Male':
                        Gender_value = 1
                    else:
                        Gender_value = 0
                    
                    print(indx["FaceDetail"])
                    print(indx["FaceDetail"]["Confidence"])
                    # add photo_person ====================
                    cur.execute(
                        'Insert into Photo_person (Photo_Id, Person_Id, Box_Height, Box_Width, Box_Top, Box_Left, AgeRange_Low, AgeRange_High, Gender, Confidence, Status, CreatedDate) values ( %d, %d, %f, %f, %f, %f, %d, %d, %d, %f, %d, "%s") ' % (
                            currentPhoto_Id, currentPerson_Id,
                            indx["FaceDetail"]["BoundingBox"]["Height"],
                            indx["FaceDetail"]["BoundingBox"]["Width"],
                            indx["FaceDetail"]["BoundingBox"]["Top"],
                            indx["FaceDetail"]["BoundingBox"]["Left"],
                            indx["FaceDetail"]["AgeRange"]["Low"],
                            indx["FaceDetail"]["AgeRange"]["High"], Gender_value,
                            indx["FaceDetail"]["Confidence"],
                            1, CreatedDate))
                    conn.commit()
                    # ============ End of found ================
                else:
                    # =========== if not found ==============
                    print("Person cannot be recognized, waiting for insert")
                    try:
                        # =============================
                        
                        currentPerson_Id = int(str(hash(uuid.uuid4()))[:7])
                        print("[Not found] currentPerson_Id: ", currentPerson_Id)
                        print("[Not found] currentPhoto_Id: ", currentPhoto_Id)
                        Person_Name = "Unknown"
                        Person_groupId = 0
                        MeetMe = 0

                        cur.execute('Insert into Person (Person_Id, Person_Name, Rekogonition_Id, Person_groupId, Person_FacePrint, MeetMe, NumOfShow, Photo_MainKeyID ) values ( %d, "%s", "%s", %d, "%s", %d, %d, "%s") ' % (
                                currentPerson_Id, Person_Name, currentFaceId, Person_groupId, currentFaceId, MeetMe, 0,key))
                        conn.commit()
                        
                        Gender_value = -1
                        if indx["FaceDetail"]["Gender"]["Value"] == 'Male':
                            Gender_value = 1
                        else:
                            Gender_value = 0
                        
                        print(indx["FaceDetail"])
                        cur.execute(
                            'Insert into Photo_person (Photo_Id, Person_Id, Box_Height, Box_Width, Box_Top, Box_Left, AgeRange_Low, AgeRange_High, Gender, Confidence, Status, CreatedDate) values ( %d, %d, %f, %f, %f, %f, %d, %d, %d, %f, %d, "%s") ' % (
                                currentPhoto_Id, currentPerson_Id,
                                indx["FaceDetail"]["BoundingBox"]["Height"],
                                indx["FaceDetail"]["BoundingBox"]["Width"],
                                indx["FaceDetail"]["BoundingBox"]["Top"],
                                indx["FaceDetail"]["BoundingBox"]["Left"],
                                indx["FaceDetail"]["AgeRange"]["Low"],
                                indx["FaceDetail"]["AgeRange"]["High"], Gender_value,
                                indx["FaceDetail"]["Confidence"], 1, CreatedDate))
                        conn.commit()
                        
                        print("[Not found] currentPerson_Id: ", currentPerson_Id)
                        print("[Not found] currentPhoto_Id: ", currentPhoto_Id)

                        s3_path = f"{temp_userId}/{currentPerson_Id}/{currentPhoto_Id}.jpg"
                        print("s3_path: ", s3_path)

                        s3_client.put_object(Bucket=bucket, Key=s3_path, Body=image_binary)
                        print("Puted successfully")

                        # =========== Print content =========
                        print("image", image_af)

                        # Print response to console
                        print("FaceResponse: ", FaceResponse)

                        # return FaceResponse # Unused for now
                    except Exception as e:
                        print("Error: ", e)
                        print("Error processing object {} from bucket {}. ".format(key, bucket))
                        raise e
                # ============ End of not found ================
                IncludedPeople.append(currentPerson_Id)  # for meet table
                b = {
                    "statusCode": 200,
                    "addAuth": 1,
                    "addMsg": f'[Person-Insertion] Person({currentPerson_Id}) has been added successfully!'
                }
            except pymysql.MySQLError as e:
                b = {
                    "statusCode": 200,
                    "addAuth": 2,
                    "addMsg": f'[Person-Insertion] something went wrong(person_id: {currentPerson_Id}): {e}'
                }
            finally:
                conn.commit()
            print("B: ", b)
    # ==========================================================================================
    
    return {
        'statusCode': 200,
        'body': "Done" # a
    }