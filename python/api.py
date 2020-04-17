# -*- coding: utf-8 -*-
# API to run call python generating methods and handle transfer.
#
# by nyLiao, 2020

import sys
# import glob
sys.path.append('gen_py')
# sys.path.append('../')
# sys.path.insert(0, glob.glob('../lib/py/build/lib*')[0])

import json
import time
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from gen_py.api import userService

sys.path.append('../GPT2-Chinese/')
from generate_class import genModel

# class Test:
#     count = 0
#
#     def test1(self, dic):
#         dic = json.loads(dic)
#         self.count += 1
#         strr = 'Hello x{}, {}!'.format(self.count, dic["txtin"])
#         time.sleep(2)
#         return strr

class Test(genModel):
    def test1(self, dic):
        dic = json.loads(dic)
        inputs = dic["txtin"]
        strr = self.gen_ph(inputs, length=300, topk=8, topp=1)
        return strr


if __name__ == "__main__":
    # Init class process
    handler = Test(model_path='../GPT2-Chinese//model/model_epoch7', tokenizer_path='../GPT2-Chinese//model/model_epoch7/vocab.txt')
    processor = userService.Processor(handler)

    # Transport layer
    ip = "127.0.0.1"
    port = 6161
    transport = TSocket.TServerSocket(ip, port)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    # Establish server
    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
    print("Starting server in python")
    server.serve()
    print("Done")
