import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Dataset, Reader, SVD
from sklearn.model_selection import train_test_split
import warnings
import shap
warnings.filterwarnings("ignore")

# ================== Lấy dữ liệu từ API ==================
def get_users():
    response = requests.get('http://localhost:3000/data/user')
    if response.status_code == 200:
        data = response.json()
        if 'data' in data:
            return pd.DataFrame(data['data'])
        else:
            raise KeyError("Key 'data' not found in response")
    else:
        raise Exception(f"Failed to get users, status code {response.status_code}")

def get_events():
    response = requests.get('http://localhost:3000/data/event')
    if response.status_code == 200:
        data = response.json()
        if 'data' in data:
            return pd.DataFrame(data['data'])
        else:
            raise KeyError("Key 'data' not found in response")
    else:
        raise Exception(f"Failed to get events, status code {response.status_code}")

def get_interactions():
    response = requests.get('http://localhost:3000/data/join')
    if response.status_code == 200:
        data = response.json()
        if 'data' in data:
            return pd.DataFrame(data['data'])
        else:
            raise KeyError("Key 'data' not found in response")
    else:
        raise Exception(f"Failed to get interactions, status code {response.status_code}")

# ================== Dữ Liệu ==================
users = get_users()
events = get_events()
interactions = get_interactions()

# Kiểm tra và xử lý cột 'hobbies' nếu có
if 'hobbies' in users.columns:
    users['hobbies'] = users['hobbies'].apply(lambda x: ', '.join(x) if isinstance(x, list) and x else 'No hobbies')
else:
    users['hobbies'] = 'No hobbies'

# ================== Tách dữ liệu Train/Test ==================
# Chia dữ liệu người dùng (80% train, 20% test)
train_users, test_users = train_test_split(users, test_size=0.2, random_state=42)
# Lấy danh sách user_id từ DataFrame
user_ids = users['user_id'].tolist()

# Chia dữ liệu ngẫu nhiên với tỉ lệ mong muốn
train_user_ids, test_user_ids = train_test_split(user_ids, test_size=0.2, random_state=42)
overlap_user_ids = test_user_ids[:len(test_user_ids)] 

# Thêm nhóm giao thoa vào train_user_ids
train_user_ids = list(set(train_user_ids + overlap_user_ids))

# Cập nhật lại train và test dựa trên các user_id đã chọn
train_users = users[users['user_id'].isin(train_user_ids)]
test_users = users[users['user_id'].isin(test_user_ids)]

# Kiểm tra số lượng và các user_id trong train và test
print(f"Số lượng user train: {len(train_users)}, Số lượng user test: {len(test_users)}")

print("\nDanh sách user_id trong train_users:")
print(train_users['user_id'].tolist())

print("\nDanh sách user_id trong test_users:")
print(test_users['user_id'].tolist())
# Chia dữ liệu sự kiện (80% train, 20% test)
train_events, test_events = train_test_split(events, test_size=0.2, random_state=42)
print(f"Số lượng event train: {len(train_events)}, Số lượng event test: {len(test_events)}")

# Chia dữ liệu tương tác (80% train, 20% test)
train_interactions, test_interactions = train_test_split(interactions, test_size=0.2, random_state=42)
print(f"Số lượng train: {len(train_interactions)}, Số lượng test: {len(test_interactions)}")

# ================== Content-Based Filtering (CBF) ==================
def content_based_recommendation(user_id, top_n=3):
    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))

    if 'category_name' not in train_events.columns:
        raise KeyError("'category_name' column not found in events dataframe")
    train_events['category_name'] = train_events['category_name'].fillna("unknown")


    event_profiles = tfidf.fit_transform(train_events['category_name'])
    user_profiles = tfidf.transform(train_users['hobbies'])

    user_idx = train_users[train_users['user_id'] == user_id].index
    if user_idx.empty:
        raise ValueError(f"User ID {user_id} not found.")
    else:
        print(f"User ID {user_id} found at index {user_idx[0]}")

    # Kiểm tra kích thước của user_profiles và event_profiles
    print(f"user_profiles shape: {user_profiles.shape}")
    print(f"event_profiles shape: {event_profiles.shape}")
    
    # Kiểm tra index của người dùng có hợp lệ không
    if user_idx[0] >= user_profiles.shape[0]:
        raise IndexError(f"User index {user_idx[0]} is out of range for user_profiles.")

    similarity_scores = cosine_similarity(user_profiles[user_idx[0]], event_profiles).flatten()
    recommendations = pd.DataFrame({
        'event_id': train_events['event_id'],
        'similarity_score': similarity_scores
    }).sort_values('similarity_score', ascending=False)

    return recommendations.head(top_n)

# ================== Collaborative Filtering (CF) ==================
def collaborative_recommendation(user_id, top_n=3):
    reader = Reader(rating_scale=(0, 1))

    # Sử dụng train_interactions để huấn luyện
    train_data = Dataset.load_from_df(train_interactions[['user_id', 'event_id', 'join']], reader)
    algo = SVD()
    trainset = train_data.build_full_trainset()
    algo.fit(trainset)

    all_event_ids = train_events['event_id']
    predictions = [
        (event_id, algo.predict(user_id, event_id).est) for event_id in all_event_ids
    ]
    predictions.sort(key=lambda x: x[1], reverse=True)
    return pd.DataFrame(predictions[:top_n], columns=['event_id', 'predicted_rating'])

# ================== Hybrid Recommendation ==================
def hybrid_recommendation(user_id, top_n=3, alpha=0.8):
    # Đề xuất dựa trên Content-Based
    cb_recs = content_based_recommendation(user_id, top_n=top_n)
    # Đề xuất dựa trên Collaborative Filtering
    cf_recs = collaborative_recommendation(user_id, top_n=top_n)

    # Tính toán điểm chung cho cả hai phương pháp
    hybrid_scores = pd.merge(cb_recs, cf_recs, on='event_id', how='outer').fillna(0)
    hybrid_scores['final_score'] = (
        alpha * hybrid_scores['similarity_score'] +
        (1 - alpha) * hybrid_scores['predicted_rating']
    )
    
    # Sắp xếp theo điểm cuối cùng
    hybrid_scores = hybrid_scores.sort_values('final_score', ascending=False).head(top_n)
    hybrid_scores = pd.merge(hybrid_scores, train_events[['event_id', 'title']], on='event_id')
    
    # Thêm lời giải thích
    explanations = []
    for index, row in hybrid_scores.iterrows():
        event_title = row['title']
        cb_score = row['similarity_score']
        cf_score = row['predicted_rating']
        
        # Giải thích về Content-Based (CB)
        if cb_score > cf_score:
            explanation = f"Hệ thống đề xuất sự kiện '{event_title}' dựa trên sở thích của bạn (sở thích của bạn là {train_users[train_users['user_id'] == user_id]['hobbies'].values[0]}), với độ tương tự {cb_score:.2f}."
        else:
            # Giải thích về Collaborative Filtering (CF)
            explanation = f"Hệ thống đề xuất sự kiện '{event_title}' dựa vào sự kiện được người dùng khác tương tác nhiều, với điểm dự đoán là {cf_score:.2f}."
        
        explanations.append(explanation)
    
    # Trả về các sự kiện được đề xuất kèm theo giải thích
    hybrid_scores['explanation'] = explanations
    return hybrid_scores[['event_id', 'title', 'final_score', 'explanation']]



# ================== SHAP Explanation ==================
def explain_with_shap(user_id, model_type='hybrid', top_n=3):
    if model_type == 'hybrid':
        recs = hybrid_recommendation(user_id, top_n=top_n)
    elif model_type == 'content_based':
        recs = content_based_recommendation(user_id, top_n=top_n)
    else:
        recs = collaborative_recommendation(user_id, top_n=top_n)

    # Giải thích mô hình SVD với SHAP
    if model_type == 'collaborative':
        reader = Reader(rating_scale=(0, 1))
        train_data = Dataset.load_from_df(train_interactions[['user_id', 'event_id', 'join']], reader)
        algo = SVD()
        trainset = train_data.build_full_trainset()
        algo.fit(trainset)
        
        # SHAP Explainer cho mô hình SVD
        explainer = shap.KernelExplainer(algo.predict, trainset.all_ratings())
        shap_values = explainer.shap_values(trainset.all_ratings())
        
        # Vẽ đồ thị giải thích SHAP
        shap.summary_plot(shap_values, trainset.all_ratings())
    
    return recs