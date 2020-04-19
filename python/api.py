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

sys.path.append('./GPT2-Chinese/')
from generate_class import genModel


class pyModel(genModel):
    def py_gen_ph(self, dic):
        dic = json.loads(dic)
        inputs = dic["inputs"]
        # length = int(dic["length"])
        # temp = float(dic["temp"])
        # topk = int(dic["topk"])
        # topp = float(dic["topp"])
        # strr = self.gen_ph(inputs, length=length, temperature=temp, topk=topk, topp=topp)
        strr = self.gen_ph(inputs, length=100, temperature=1.5, topk=2, topp=1.)
        return strr


if __name__ == "__main__":
    # Init class process
    print("Starting server in python...")
    handler = pyModel(model_path='./GPT2-Chinese//model/model_epoch7', tokenizer_path='./GPT2-Chinese//model/model_epoch7/vocab.txt')
    processor = userService.Processor(handler)

    # Transport layer
    ip = "127.0.0.1"
    port = 6161
    transport = TSocket.TServerSocket(ip, port)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    # Establish server
    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
    print("Server started")
    server.serve()
    print("Server closed")
