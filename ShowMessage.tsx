import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createMessage, getMessages, uploadImage } from '~/apis/chat.api';
import { uploadImageCloudinary } from '~/apis/message.api';
import io from 'socket.io-client';
import { generateRandomOrderCode } from '~/utils/utils';
import { AppContext } from '~/contexts/app.context';
import { toast } from 'react-toastify';
import Compressor from 'compressorjs';

const serverUrl = 'https://socket.amzorders.net';

const ShowMessage = ({ isOpen, onClose, data: data1, name: name1 }: any) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [contentMessage, setContentMessage] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const messagesContainerRef = useRef<any | null>(null);
  const [skip, setSkip] = useState(0); // Start from the latest message
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const limit = 10;
  const { profile } = useContext(AppContext);
  const queryClient = useQueryClient();
  console.log('contentMessage', contentMessage);

  // Scroll to the bottom whenever new messages are added
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [contentMessage]);

  const { data: dataMess } = useQuery({
    queryKey: ['message-chat', name1],
    queryFn: () => {
      return getMessages(limit, skip, name1);
    },
    onSuccess: (data) => {
      setContentMessage(data?.data.getMessage.content.reverse());
      scrollToBottom();
    },
    cacheTime: 60000,
  });

  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const [valueInput, setValueInput] = useState<string>('');

  const chatMutation = useMutation({
    mutationFn: (body: any) => {
      return createMessage(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message', 5] });
      const socket = io(serverUrl);
      socket.emit('sendMessAdmin');
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (valueInput.trim() !== '') {
      const newData = {
        message: valueInput,
        sender: dataMess?.data.getMessage?.sender,
        receiver: name1,
        userId: profile._id,
        store: true,
      };
      setValueInput('');

      const newMessage = {
        _id: generateRandomOrderCode(10),
        userId: profile._id,
        message: valueInput,
      };
      setContentMessage((prevMessages: any) => [...prevMessages, newMessage]);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['message-chat', data1] });
      }, 1000);
      queryClient.invalidateQueries({ queryKey: ['message', 5] });
      chatMutation.mutate(newData);
    }
  };

  useEffect(() => {
    const socket = io(serverUrl);
    socket.on('receiveMessAdmin', () => {
      queryClient.invalidateQueries({ queryKey: ['message-chat', name1] });
      queryClient.invalidateQueries({ queryKey: ['message', 5] });
    });
    socket.on('receiveImageAdmin', () => {
      queryClient.invalidateQueries({ queryKey: ['message-chat', 3] });
      queryClient.invalidateQueries({ queryKey: ['message', 5] });
    });
  }, [data1, queryClient]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setIsModalVisible(false);
  };

  // Giữ mutation cũ để backward compatible (upload file qua server nếu cần dùng lại ở nơi khác)
  const mutationChangeAvatar = useMutation((formData: FormData) => uploadImage(formData), {
    onSuccess: () => {
      const socket = io(serverUrl);
      queryClient.invalidateQueries(['message-chat', name1]);
      socket.emit('sendMessUserByClient');
    },
    onError: () => {
      toast.error('Up ảnh thất bại!');
    },
  });

  // Mutation lưu URL ảnh Cloudinary vào database
  const mutationChangeAvatarCloudinary = useMutation(
    (body: { sender: string; receiver: string; image: string }) => uploadImageCloudinary(body),
    {
      onSuccess: () => {
        const socket = io(serverUrl);
        queryClient.invalidateQueries(['message-chat', name1]);
        socket.emit('sendMessUserByClient');
      },
      onError: () => {
        toast.error('Up ảnh thất bại!');
      },
    }
  );

  // Handler mới: upload ảnh trực tiếp lên Cloudinary rồi lưu link vào DB
  const handleAvatarCloudinary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPEG, PNG hoặc WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng file quá lớn, vui lòng chọn file nhỏ hơn 5MB.');
      return;
    }

    // Đổi tên file ngắn gọn
    const renamedFile = new File([file], `mess.${file.type.split('/')[1]}`, {
      type: file.type,
      lastModified: file.lastModified,
    });

    try {
      const compressedFile: File = await new Promise((resolve, reject) => {
        new Compressor(renamedFile, {
          quality: 0.7,
          maxWidth: 1920,
          success: (result: File) => resolve(result),
          error: (err) => reject(err),
        });
      });

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', 'glory365');
      formData.append('folder', 'api-glory365');

      const response = await fetch(`https://api.cloudinary.com/v1_1/dbsy0kyh5/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        throw new Error(data.message || 'Upload ảnh thất bại!');
      }

      // Gửi URL ảnh lên backend để lưu message (chỉ lưu link)
      const body = {
        sender: profile?._id as string,
        receiver: name1 as string,
        image: data.secure_url as string,
      };

      await mutationChangeAvatarCloudinary.mutateAsync(body);
      toast.success('Upload ảnh thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Upload ảnh thất bại!');
    }
  };

  const fetchMoreMessages = async () => {
    const newSkip = skip + limit;
    const response = await getMessages(limit, newSkip, name1);
    if (response.data.getMessage.content.length > 0) {
      setContentMessage((prevMessages: any) => [...response.data.getMessage.content, ...prevMessages]);
      setSkip(newSkip);
    } else {
      setHasMoreMessages(false);
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      if (messagesContainerRef.current.scrollTop === 0 && hasMoreMessages) {
        fetchMoreMessages();
      }
    }
  };
  const getImageUrl = (image: string) => {
    if (image?.startsWith('https://')) {
      return image;
    }
    return `https://api.amzorders.net/${image}`;
  }

  return (
    <div
      id="authentication-modal"
      tabIndex={-1}
      aria-hidden="true"
      onClick={handleModalClick}
      className={` ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} fixed bg-[#02020246] dark:bg-[#ffffff46] top-0 left-0 right-0 z-50 w-[100vw] p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100vh] transition-all`}
    >
      <div
        ref={modalRef}
        className="relative z-100 w-full left-[50%] top-[50%] translate-y-[-50%] translate-x-[-50%] max-w-md max-h-full"
      >
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide="authentication-modal"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
          <div className="px-6 py-6 lg:px-8">
            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Nhắn tin</h3>
            <div className="space-y-6">
              <div>
                <div
                  onScroll={handleScroll}
                  ref={messagesContainerRef}
                  className="border p-2 min-h-[300px] h-[300px] overflow-x-auto flex flex-col-reverse items-end"
                >
                  <div className="h-max mt-auto w-full">
                    {contentMessage?.map((item: any) => (
                      <div
                        key={item._id}
                        className={` p-2 mb-2 rounded-r-xl w-max max-w-[70%] ${item.userId === dataMess?.data.getMessage.sender
                          ? 'rounded-r-xl bg-gray-100'
                          : 'rounded-l-xl ml-auto bg-blue-100'
                          }  rounded-t-xl`}
                      >
                        {item?.message !== '' ? (
                          <div className="flex flex-col space-y-2 text-xs w-full">
                            <p className="">{item.message}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-2 text-xs w-full">
                            <button onClick={() => handleImageClick(getImageUrl(item?.image[0]))}>
                              <img className="cursor-pointer max-w-[100px]" src={getImageUrl(item?.image[0])} alt="" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="h-[50px] flex w-full border">
                  <label htmlFor="dropzone-file" className="w-14 flex items-center justify-center cursor-pointer">
                    <input
                      id="dropzone-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarCloudinary}
                    />
                    <svg width="22" height="22" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <title>Chọn ảnh</title>
                      <g stroke="none">
                        <g fill="gray">
                          <path
                            d="M368,109 C366.896,109 366,108.104 366,107 C366,105.896 366.896,105 368,105 C369.104,105 370,105.896 370,107 C370,108.104 369.104,109 368,109 L368,109 Z M368,103 C365.791,103 364,104.791 364,107 C364,109.209 365.791,111 368,111 C370.209,111 372,109.209 372,107 C372,104.791 370.209,103 368,103 L368,103 Z M390,116.128 L384,110 L374.059,120.111 L370,116 L362,123.337 L362,103 C362,101.896 362.896,101 364,101 L388,101 C389.104,101 390,101.896 390,103 L390,116.128 L390,116.128 Z M390,127 C390,128.104 389.104,129 388,129 L382.832,129 L375.464,121.535 L384,112.999 L390,118.999 L390,127 L390,127 Z M364,129 C362.896,129 362,128.104 362,127 L362,126.061 L369.945,118.945 L380.001,129 L364,129 L364,129 Z M388,99 L364,99 C361.791,99 360,100.791 360,103 L360,127 C360,129.209 361.791,131 364,131 L388,131 C390.209,131 392,129.209 392,127 L392,103 C392,100.791 390.209,99 388,99 L388,99 Z"
                          ></path>
                        </g>
                      </g>
                    </svg>
                  </label>
                  <input
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    className="w-full px-5"
                    type="text"
                    placeholder="Vui lòng nhập ..."
                  />
                  <button type="submit" className="w-14 flex items-center justify-center">
                    <svg viewBox="0 0 22 22" width="30" height="30" className={` rounded-full p-1.5 ${valueInput !== '' ? 'hover:bg-black hover:bg-opacity-5 transition-all' : ''}`}>
                      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(-5.000000, -5.000000)" className={`${valueInput !== '' ? 'fill-primary' : 'fill-[#8A8D91]'}`}>
                          <g>
                            <g transform="translate(5.000000, 5.000000)">
                              <path d="M2.0300068,0.145970044 L20.9662955,9.37015518 C22.3445682,10.0420071 22.3445682,11.9582654 20.9662955,12.6296618 L2.0300068,21.853847 C1.09728834,22.3084288 0,21.6475087 0,20.6317597 L0.806953417,13.8945654 C0.882225434,13.2659853 1.39089595,12.7699536 2.03608467,12.6957083 L12.0229514,11.6795038 C12.8612292,11.5943266 12.8612292,10.4054904 12.0229514,10.3203132 L2.03608467,9.30410872 C1.39089595,9.23031889 0.882225434,8.7342872 0.806953417,8.10525162 L0,1.36805729 C0,0.352308292 1.09728834,-0.3081563 2.0300068,0.145970044"></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalVisible && selectedImage && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="max-w-screen-lg max-h-screen-lg relative">
            <img src={selectedImage} alt="Phóng to" className="w-96 h-auto" />
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowMessage;
