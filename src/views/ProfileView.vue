<script setup>
import { ref } from "vue";

const statusMessage = ref("(心情狀態) 我度過了難熬的一天");
const followerCount = ref("(顯示追蹤數) 1234");

// 這裡貼寵物大頭貼圖片網址
const petAvatar = ref(
  "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg"
);

// 底部圖片資料 (定義三組，手機版會自動隱藏最後一組)
const imgList = ref([
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOCxmFu8e5UtarR5p-TApZWjqRmNX65pnHYg&s",
    url: "連結1",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE88tdQXXidf2uGgjJYj2-EzhGMPHy1Efd3A&s",
    url: "連結2",
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyER23g_RhNc8N66fo45XSH2WxgcE7cylSqA&s  ",
    url: "連結3",
  },
]);
</script>

<template>
  <div
    class="min-h-screen bg-[#FDF2F2] p-4 md:p-10 flex justify-center items-start font-sans"
  >
    <div
      class="w-full max-w-[360px] md:max-w-[768px] lg:max-w-[1024px] bg-[#FCE8E8] rounded-[50px] shadow-sm p-4 md:p-12"
    >
      <div class="w-full flex justify-center mb-6">
        <div
          class="w-[85%] md:w-3/4 bg-white rounded-lg py-2 md:py-3 shadow-sm relative text-center"
        >
          <span class="text-gray-700 font-bold text-base md:text-xl">{{
            statusMessage
          }}</span>
          <div
            class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white"
          ></div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row items-stretch gap-4 md:gap-8 mb-8">
        <div
          class="flex flex-col items-center justify-between w-full md:w-[300px] lg:w-[350px]"
        >
          <div
            class="w-48 h-48 md:w-full md:h-auto md:aspect-square bg-white rounded-[40px] overflow-hidden shadow-sm"
          >
            <img :src="petAvatar" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-4 text-white text-2xl py-2">
            <span>★</span><span>⬅</span><span>●</span><span>✿</span
            ><span>斜</span>
          </div>
          <div
            class="bg-white px-6 py-1 rounded-md text-xs font-black text-gray-500 shadow-sm"
          >
            追蹤數 {{ followerCount }}
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-3 mt-4 md:mt-0">
          <div
            class="bg-white p-2 md:p-5 rounded-xl text-center text-base font-bold text-gray-700 shadow-sm"
          >
            <!-- 顯示註冊時選擇的標籤 -->
            (註冊時選擇的標籤)滑稽、搞笑、無語、歡樂、療癒、可愛
          </div>
          <div
            class="h-32 md:flex-1 bg-white rounded-[30px] flex items-center justify-center text-gray-500 font-black text-xl shadow-sm border-2 border-dashed border-pink-50"
          >
            <!-- 收藏/追蹤活動 -->
            品種：柴犬<br>
            生日：2018/08/08<br>
            性別：男生<br>
            愛好：吃飯、睡覺、玩耍<br>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          class="w-full h-14 md:h-24 bg-white rounded-[20px] md:rounded-[40px] shadow-sm flex items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-lg md:text-2xl font-black text-gray-800">
            <!-- text -->
            文章預覽1(有字數限制)
          </span>
        </div>
        <div
          class="w-full h-14 md:h-24 bg-white rounded-[20px] md:rounded-[40px] shadow-sm flex items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-lg md:text-2xl font-black text-gray-800">
            <!-- text -->
            文章預覽2(有字數限制)
          </span>
        </div>
        <div
          class="hidden md:flex w-full h-24 bg-white rounded-[40px] shadow-sm items-center justify-center relative"
        >
          <div
            class="absolute -top-3 left-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <div
            class="absolute -top-3 right-[15%] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white"
          ></div>
          <span class="text-2xl font-black text-gray-800">
            <!-- text -->
            文章預覽3(有字數限制)
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
        <a
          v-for="(img, index) in imgList"
          :key="'img-' + index"
          :href="img.url"
          target="_blank"
          :class="[
            'aspect-square bg-white rounded-[25px] md:rounded-[45px] shadow-sm overflow-hidden hover:scale-105 transition-all border-4 border-white hover:border-[#FFC2D1] flex items-center justify-center',
            index === 2 ? 'hidden md:flex' : 'flex',
          ]"
        >
          <img :src="img.src" class="w-full h-full object-cover" />
          <span
            v-if="!img.src"
            class="text-xl md:text-3xl font-black text-gray-300"
            >img</span
          >
        </a>
      </div>
    </div>
  </div>
</template>
